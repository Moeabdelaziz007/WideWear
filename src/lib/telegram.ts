/**
 * Sends a message via Telegram Bot API to a specific chat.
 * Used for order notifications to admin.
 */
export async function sendTelegramNotification(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
        console.warn("[Telegram] Missing BOT_TOKEN or ADMIN_CHAT_ID — skipping notification");
        return;
    }

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
            }),
        });
    } catch (error) {
        console.error("[Telegram] Failed to send notification:", error);
    }
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
💰 <b>${order.total.toLocaleString()} EGP</b> (${order.paymentMethod === "cod" ? "دفع عند الاستلام" : order.paymentMethod})

📦 <b>${order.items.length} منتج:</b>
${itemsList}`;
}
