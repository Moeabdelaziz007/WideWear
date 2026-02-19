import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

// For Fawry Server-to-Server (webhook) notification processing
const FAWRY_SECURE_KEY = process.env.FAWRY_SECURE_KEY || "sandbox_key";

export async function POST(request: Request) {
    try {
        const bodyText = await request.text();
        const notification = JSON.parse(bodyText);

        // Fawry sends: requestId, fawryRefNumber, merchantRefNumber, customerMobile, customerMail, paymentAmount, orderAmount, orderStatus, signature, etc.
        const {
            requestId,
            fawryRefNumber,
            merchantRefNumber,
            customerMobile,
            customerMail,
            paymentAmount,
            orderAmount,
            fawryFees,
            shippingFees,
            orderStatus,
            paymentMethod,
            messageSignature,
            paymentRefrenceNumber
        } = notification;

        // 1. Verify Signature to ensure the request actually came from Fawry
        // Format: fawryRefNumber + merchantRefNumber + paymentAmount + orderAmount + orderStatus + paymentMethod + paymentRefrenceNumber + secureKey
        const signatureString = `${fawryRefNumber}${merchantRefNumber}${Number(paymentAmount).toFixed(2)}${Number(orderAmount).toFixed(2)}${orderStatus}${paymentMethod}${paymentRefrenceNumber}${FAWRY_SECURE_KEY}`;
        const generatedSignature = crypto.createHash("sha256").update(signatureString).digest("hex");

        if (generatedSignature !== messageSignature) {
            console.error("[Fawry Webhook] Invalid signature detected. Possible tampering.", { generatedSignature, messageSignature });
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Process Status Update
        // Status codes: NEW, PAID, CANCELED, DELIVERED, REFUNDED, EXPIRED, PARTIAL_REFUNDED, FAILED
        console.log(`[Fawry Webhook] Order ${merchantRefNumber} status update: ${orderStatus}`);

        const supabase = await createClient();

        let mappedStatus = "pending";
        if (orderStatus === "PAID") mappedStatus = "confirmed";
        else if (orderStatus === "CANCELED" || orderStatus === "EXPIRED" || orderStatus === "FAILED") mappedStatus = "cancelled";
        else if (orderStatus === "REFUNDED") mappedStatus = "refunded";

        // 3. Update Order in Supabase
        const { error } = await supabase
            .from("orders")
            .update({
                status: mappedStatus,
                transaction_id: fawryRefNumber
            })
            .eq("id", merchantRefNumber); // merchantRefNumber is our order.id

        if (error) {
            console.error("[Fawry Webhook] Error updating order in Supabase:", error);
            // Return 500 so Fawry retries the notification later
            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        // Return 200 OK so Fawry knows we received it successfully
        return NextResponse.json({ status: "success" }, { status: 200 });

    } catch (error) {
        console.error("[Fawry Webhook] Processing error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
