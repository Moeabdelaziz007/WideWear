type NotificationChannel = "telegram" | "whatsapp" | "messenger";

/**
 * Sends a message via multiple channels (Telegram, WhatsApp, Messenger).
 * Used for order notifications to admin or customers.
 */
export async function sendOrderNotification(
    message: string,
    channels: NotificationChannel[] = ["telegram"]
) {
    const promises = channels.map(async (channel) => {
        try {
            switch (channel) {
                case "telegram":
                    return await _sendTelegram(message);
                case "whatsapp":
                    return await _sendWhatsApp(message);
                case "messenger":
                    return await _sendMessenger(message);
                default:
                    console.warn(`[Notifications] Unknown channel: ${channel}`);
            }
        } catch (error) {
            console.error(`[Notifications] Failed to send via ${channel}:`, error);
        }
    });

    await Promise.allSettled(promises);
}

// --- Internal Channel Implementations ---

async function _sendTelegram(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
        console.warn("[Telegram] Missing BOT_TOKEN or ADMIN_CHAT_ID — skipping notification");
        return;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
        }),
    });

    if (!res.ok) throw new Error(await res.text());
}

async function _sendWhatsApp(message: string) {
    // Placeholder for WhatsApp Business API Integration
    // Requires Meta App ID, Token, and Phone Number ID
    console.log("[WhatsApp] Prepared to send message:", message.slice(0, 20) + "...");
}

async function _sendMessenger(message: string) {
    // Placeholder for Facebook Messenger Send API
    // Requires Facebook Page Token
    console.log("[Messenger] Prepared to send message:", message.slice(0, 20) + "...");
}

/**
 * Formats a new order into a Telegram-friendly message.
 */
export function formatOrderNotification(order: {
    id: string;
    customerName: string;
    phone: string;
    address: string;
    total: number;
    paymentMethod: string;
    shippingMethod?: string;
    items: { name: string; size: string; quantity: number }[];
}) {
    const itemsList = order.items
        .map((item) => `  • ${item.name} (${item.size}) × ${item.quantity}`)
        .join("\n");

    return `🛒 <b>طلب جديد!</b>

🆔 <code>#${order.id.slice(0, 8).toUpperCase()}</code>
👤 ${order.customerName}
📱 ${order.phone}
📍 ${order.address}
✈️ ${order.shippingMethod || "standard"}
💰 <b>${order.total.toLocaleString()} EGP</b> (${order.paymentMethod === "cod" ? "دفع عند الاستلام" : order.paymentMethod})

📦 <b>${order.items.length} منتج:</b>
${itemsList}`;
}
