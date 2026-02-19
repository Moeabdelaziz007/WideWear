import crypto from "crypto";

/**
 * Fawry Sandbox API Integration
 * Documentation: https://developer.fawrystaging.com/docs/server-apis/charge-request
 */

const FAWRY_MERCHANT_CODE = process.env.FAWRY_MERCHANT_CODE || "sandbox"; // Replace with real sandbox code or prod code
const FAWRY_SECURE_KEY = process.env.FAWRY_SECURE_KEY || "sandbox_key"; // Keep this extremely secure
const IS_SANDBOX = process.env.NODE_ENV !== "production" || process.env.FAWRY_TEST_MODE === "true";
const FAWRY_API_URL = IS_SANDBOX
    ? "https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge"
    : "https://www.atfawry.com/ECommerceWeb/Fawry/payments/charge";

export interface FawryItem {
    itemId: string;
    description: string;
    price: number;
    quantity: number;
}

export interface FawryChargeRequest {
    merchantRefNum: string; // The order ID from Supabase
    customerProfileId: string; // The user ID from Supabase
    customerName: string;
    customerMobile: string;
    customerEmail: string;
    amount: number;
    currencyCode: "EGP";
    chargeItems: FawryItem[];
    returnUrl?: string; // Where user goes after payment
}

/**
 * Generates the SHA-256 HMAC Signature required by Fawry
 */
function generateSignature(request: FawryChargeRequest): string {
    // Signature String Format: merchantCode + merchantRefNum + customerProfileId + returnUrl + itemId1 + quantity1 + price1 + itemId2 + quantity2 + price2 + ... + secureKey

    let signatureString = `${FAWRY_MERCHANT_CODE}${request.merchantRefNum}${request.customerProfileId}`;
    if (request.returnUrl) signatureString += request.returnUrl;

    // Must sort items by ID or ensure consistent ordering, standard Fawry docs suggest just iterating in order sent
    for (const item of request.chargeItems) {
        // According to Fawry docs, decimal places formatting matters based on version. 
        // We ensure 2 decimal places for price stringification: Number(item.price).toFixed(2)
        signatureString += `${item.itemId}${item.quantity}${Number(item.price).toFixed(2)}`;
    }

    signatureString += FAWRY_SECURE_KEY;

    return crypto.createHash('sha256').update(signatureString).digest('hex');
}

/**
 * Creates the payload payload to be sent to Fawry
 */
export function buildChargePayload(request: FawryChargeRequest) {
    const signature = generateSignature(request);

    return {
        merchantCode: FAWRY_MERCHANT_CODE,
        merchantRefNum: request.merchantRefNum,
        customerProfileId: request.customerProfileId,
        customerName: request.customerName,
        customerMobile: request.customerMobile,
        customerEmail: request.customerEmail,
        paymentMethod: "PAYATFAWRY", // Can be CARD, WALLET, or PAYATFAWRY (Cash)
        amount: Number(request.amount).toFixed(2),
        currencyCode: request.currencyCode,
        language: "en-gb", // Or ar-eg
        chargeItems: request.chargeItems,
        signature: signature,
        returnUrl: request.returnUrl,
    };
}
