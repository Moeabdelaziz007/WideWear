import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderNotification, formatOrderNotification } from "@/lib/notifications";
import { CreateOrderSchema } from "@/lib/validations";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis safely
const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? Redis.fromEnv()
        : null;

/**
 * POST /api/orders
 * Creates a new order with strict validation (Zod) and Atomic RPC checkout.
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Validate user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse and Validate request body using Zod
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = CreateOrderSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.format() },
                { status: 400 }
            );
        }

        const data = parseResult.data;

        // Phase 2: Idempotency check
        const idempotencyKey = request.headers.get("Idempotency-Key");
        if (idempotencyKey && redis) {
            try {
                const cachedResponse = await redis.get(`idem:${user.id}:${idempotencyKey}`);
                if (cachedResponse) {
                    console.log("[Idempotency] Returning cached response for key:", idempotencyKey);
                    return NextResponse.json(cachedResponse, { status: 201 });
                }
            } catch (err) {
                console.error("[Idempotency] Redis GET error:", err);
                // Fail open to allow transaction natively if Redis errors
            }
        }

        // 3. Execute Atomic Checkout via RPC
        const { data: orderId, error: rpcError } = await supabase.rpc("checkout_order", {
            p_user_id: user.id,
            p_shipping_address: data.shippingAddress,
            p_phone: data.phone,
            p_payment_method: data.paymentMethod,
            p_shipping_method: data.shippingMethod,
            p_notes: data.notes || null,
        });

        if (rpcError || !orderId) {
            console.error("[RPC Error]", rpcError);
            return NextResponse.json(
                { error: "Order process failed", details: rpcError?.message },
                { status: 400 } // Often 400 because it fails if cart empty or out of stock
            );
        }

        // 4. Fetch the created order details for notification & fawry
        const { data: orderData } = await supabase
            .from("orders")
            .select("total, order_items(name_en, size, quantity, price)")
            .eq("id", orderId)
            .single<{ total: number; order_items: { name_en: string; size: string; quantity: number; price: number }[] }>();

        // 5. Send Unified Notification
        if (orderData) {
            await sendOrderNotification(
                formatOrderNotification({
                    id: orderId,
                    customerName: data.shippingAddress.fullName,
                    phone: data.phone,
                    address: `${data.shippingAddress.addressLine1}${data.shippingAddress.addressLine2 ? ', ' + data.shippingAddress.addressLine2 : ''}, ${data.shippingAddress.city}`,
                    total: orderData.total,
                    paymentMethod: data.paymentMethod,
                    shippingMethod: data.shippingMethod,
                    items: orderData.order_items.map((item: any) => ({
                        name: item.name_en,
                        size: item.size,
                        quantity: item.quantity,
                    })),
                }),
                ['telegram']
            );
        }

        // 6. Update user profile with latest shipping info async
        supabase
            .from("profiles")
            .update({
                full_name: data.shippingAddress.fullName,
                phone: data.phone,
                address_line1: data.shippingAddress.addressLine1,
                address_line2: data.shippingAddress.addressLine2 || null,
                city: data.shippingAddress.city,
            })
            .eq("id", user.id)
            .then(); // fire and forget

        // 7. Payment Gateway Routing & Idempotency Cache
        const finalResponse: { orderId: string; fawryUrl?: string } = { orderId: orderId };

        if (data.paymentMethod === "fawry" && orderData) {
            try {
                const { buildChargePayload } = await import("@/lib/fawry");
                const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/en/checkout/success?orderId=${orderId}`;

                const payload = buildChargePayload({
                    merchantRefNum: orderId,
                    customerProfileId: user.id,
                    customerName: data.shippingAddress.fullName,
                    customerMobile: data.phone,
                    customerEmail: user.email || 'customer@widewear.com',
                    amount: orderData.total,
                    currencyCode: "EGP",
                    returnUrl: returnUrl,
                    chargeItems: orderData.order_items.map((item: { name_en: string; price: number; quantity: number; size: string }) => ({
                        itemId: item.name_en, // ideally product ID but name is fine for Fawry UI
                        description: item.name_en,
                        price: item.price,
                        quantity: item.quantity
                    }))
                });

                const hostedCheckoutUrl = `https://atfawry.fawrystaging.com/ECommercePlugin/FawryPay.jsp?chargeRequest=${encodeURIComponent(JSON.stringify(payload))}`;
                finalResponse.fawryUrl = hostedCheckoutUrl;

            } catch (err) {
                console.error("Fawry Generation Error:", err);
            }
        }

        // Cache the successful response for 24 hours
        if (idempotencyKey && redis) {
            try {
                await redis.set(`idem:${user.id}:${idempotencyKey}`, finalResponse, { ex: 86400 });
            } catch (err) {
                console.error("[Idempotency] Redis SET error:", err);
            }
        }

        return NextResponse.json(finalResponse, { status: 201 });
    } catch (error) {
        console.error("[Orders API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
