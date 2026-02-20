import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderNotification, formatOrderNotification } from "@/lib/notifications";

/**
 * POST /api/orders
 * Creates a new order with server-side validation.
 * - Validates user session
 * - Validates cart items exist and products are in stock
 * - Calculates total server-side (prevents price manipulation)
 * - Creates order + order items
 * - Decrements product stock
 * - Clears cart
 * - Sends Telegram notification
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Validate user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse request body
        const body = await request.json();
        const { fullName, phone, address1, address2, city, notes, paymentMethod, shippingMethod } = body;

        if (!fullName || !phone || !address1) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // shippingMethod is optional but must be a valid choice if provided
        const validMethods = ["standard", "fast", "pickup"];
        if (shippingMethod && !validMethods.includes(shippingMethod)) {
            return NextResponse.json({ error: "Invalid shipping method" }, { status: 400 });
        }

        // 3. Fetch cart items with product data
        const { data: cartItems, error: cartError } = await supabase
            .from("cart_items")
            .select(`
                id, product_id, size, color, quantity,
                product:products(id, name_ar, name_en, price, sale_price, stock, images)
            `)
            .eq("user_id", user.id);

        if (cartError || !cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 4. Validate stock + calculate total server-side
        let total = 0;
        const orderItems: {
            product_id: string;
            name_ar: string;
            name_en: string;
            price: number;
            size: string;
            color: string | null;
            quantity: number;
            image_url: string | null;
        }[] = [];

        for (const item of cartItems) {
            const product = Array.isArray(item.product) ? item.product[0] : item.product;
            if (!product) continue;

            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `${product.name_en} is out of stock` },
                    { status: 400 }
                );
            }

            const unitPrice = product.sale_price ?? product.price;
            total += unitPrice * item.quantity;

            orderItems.push({
                product_id: product.id,
                name_ar: product.name_ar,
                name_en: product.name_en,
                price: unitPrice,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                image_url: product.images?.[0] ?? null,
            });
        }

        // 5. Create order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: user.id,
                status: "pending",
                total,
                shipping_address: {
                    fullName,
                    address1,
                    address2: address2 || null,
                    city: city || "Cairo",
                },
                phone,
                payment_method: paymentMethod || "cod",
                shipping_method: shippingMethod || "standard",
                notes: notes || null,
            })
            .select("id")
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // 6. Create order items
        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

        if (itemsError) {
            // Rollback: delete the order
            await supabase.from("orders").delete().eq("id", order.id);
            return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
        }

        // 7. Decrement stock
        for (const item of orderItems) {
            try {
                await supabase.rpc("decrement_stock", {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity,
                });
            } catch {
                // If RPC doesn't exist, stock will be managed via admin dashboard
            }
        }

        // 8. Clear cart
        await supabase.from("cart_items").delete().eq("user_id", user.id);

        // 9. Send Unified Notification (Telegram, WhatsApp, etc)
        await sendOrderNotification(
            formatOrderNotification({
                id: order.id,
                customerName: fullName,
                phone,
                address: `${address1}${address2 ? `, ${address2}` : ""}, ${city || "Cairo"}`,
                total,
                paymentMethod: paymentMethod || "cod",
                shippingMethod: shippingMethod || "standard",
                items: orderItems.map((item) => ({
                    name: item.name_ar,
                    size: item.size,
                    quantity: item.quantity,
                })),
            }),
            ['telegram'] // Defaulting to Telegram for now until Meta API keys are active
        );

        // 10. Update user profile with latest shipping info
        await supabase
            .from("profiles")
            .update({
                full_name: fullName,
                phone,
                address_line1: address1,
                address_line2: address2 || null,
                city: city || "Cairo",
            })
            .eq("id", user.id);

        if (paymentMethod === "fawry") {
            try {
                // Dynamically import to avoid edge runtime issues if crypto restricts
                const { buildChargePayload, FAWRY_API_URL } = await import("@/lib/fawry");

                const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/en/checkout/success?orderId=${order.id}`;

                const payload = buildChargePayload({
                    merchantRefNum: order.id,
                    customerProfileId: user.id,
                    customerName: fullName,
                    customerMobile: phone,
                    customerEmail: user.email || 'customer@widewear.com',
                    amount: total,
                    currencyCode: "EGP",
                    returnUrl: returnUrl,
                    chargeItems: orderItems.map(item => ({
                        itemId: item.product_id,
                        description: item.name_en,
                        price: item.price,
                        quantity: item.quantity
                    }))
                });

                // In a production scenario, you might send this to FAWRY_API_URL.
                // For this implementation, we will mock the Fawry URL redirection or use their test UI
                // The Fawry Hosted Checkout URL format:
                // const fawryUrl = `https://atfawry.fawrystaging.com/ECommercePlugin/FawryPay.jsp?chargeRequest=${encodeURIComponent(JSON.stringify(payload))}`;

                // Actually doing the S2S charge request to get a reference number
                const fawryRes = await fetch(FAWRY_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const fawryData = await fawryRes.text();
                console.log("[Fawry API Response]", fawryData);

                // If S2S fails or we strictly want Hosted Checkout, we can just return the hosted URL
                // Let's pass the hosted Checkout URL directly
                const hostedCheckoutUrl = `https://atfawry.fawrystaging.com/ECommercePlugin/FawryPay.jsp?chargeRequest=${encodeURIComponent(JSON.stringify(payload))}`;

                return NextResponse.json({
                    orderId: order.id,
                    fawryUrl: hostedCheckoutUrl // Frontend will redirect here
                }, { status: 201 });

            } catch (err) {
                console.error("Fawry Generation Error:", err);
                // Fallback to success page without fawry redirect
                return NextResponse.json({ orderId: order.id }, { status: 201 });
            }
        }

        return NextResponse.json({ orderId: order.id }, { status: 201 });
    } catch (error) {
        console.error("[Orders API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
