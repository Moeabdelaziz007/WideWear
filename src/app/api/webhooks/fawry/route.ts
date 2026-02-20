import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramNotification } from "@/lib/telegram";
import * as Sentry from "@sentry/nextjs";

const FAWRY_SECURE_KEY = process.env.FAWRY_SECURE_KEY || "sandbox_key";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase Admin client lazily (avoids build-time errors if env vars are missing)
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
    if (supabaseAdmin) return supabaseAdmin;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    }
    return supabaseAdmin;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Standard Fawry S2S Notification Body fields
        const {
            fawryRefNumber,
            merchantRefNum,
            paymentAmount,
            orderAmount,
            orderStatus,
            paymentMethod,
            paymentRefrenceNumber,
            signature,
        } = body;

        // Ensure amount strings are exactly 2 decimal places for signature verification
        let amountStr = Number(paymentAmount).toFixed(2);
        let orderAmountStr = Number(orderAmount).toFixed(2);

        // Fawry V2 Signature Generation: fawryRefNumber + merchantRefNum + Payment amount + Order amount + Order Status + Payment method + Payment reference number + secureKey
        const signatureString = `${fawryRefNumber || ""}${merchantRefNum || ""}${amountStr}${orderAmountStr}${orderStatus || ""}${paymentMethod || ""}${paymentRefrenceNumber || ""}${FAWRY_SECURE_KEY}`;

        // Compute SHA-256 Hash
        const generatedSignature = crypto
            .createHash("sha256")
            .update(signatureString)
            .digest("hex");

        if (generatedSignature.toLowerCase() !== signature?.toLowerCase()) {
            console.error("[Fawry Webhook] Invalid Signature", { expected: generatedSignature, received: signature });
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        console.log(`[Fawry Webhook] Verified payment for Order ${merchantRefNum}. Status: ${orderStatus}`);

        let newDbStatus = "pending";

        if (orderStatus === "PAID" || orderStatus === "NEW") {
            newDbStatus = "confirmed";
        } else if (orderStatus === "CANCELED" || orderStatus === "EXPIRED" || orderStatus === "FAILED") {
            newDbStatus = "cancelled";
        }

        // Update Order in Supabase
        const admin = getSupabaseAdmin();
        if (!admin) {
            console.error("[Fawry Webhook] Supabase credentials not configured");
            return NextResponse.json({ error: "Server not configured" }, { status: 500 });
        }
        const { error } = await admin
            .from("orders")
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore generic inference broken
            .update({ status: newDbStatus })
            .eq("id", merchantRefNum);

        if (error) {
            console.error("[Fawry Webhook] Supabase Update failed:", error);
            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        // Phase 6: Telegram Integration for Webhooks
        if (newDbStatus === "confirmed") {
            await sendTelegramNotification(
                `💸 <b>تم الدفع بنجاح!</b>\n\n` +
                `🆔 <code>#${merchantRefNum.slice(0, 8).toUpperCase()}</code>\n` +
                `🏦 طريقة الدفع: Fawry (${paymentMethod})\n` +
                `💰 المبلغ المباشر: ${amountStr} EGP\n` +
                `🔄 رقم مرجع فوري: ${fawryRefNumber}`
            );
        }

        return NextResponse.json({ success: true, message: "Webhook processed" });
    } catch (error) {
        console.error("[Fawry Webhook] Unhandled error:", error);
        Sentry.captureException(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
