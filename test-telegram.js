const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
} else {
    console.log("No .env.local found");
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (!token || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID in .env.local");
    process.exit(1);
}

const message = `🚀 <b>WIDEWEAR TELEGRAM INTEGRATION SUCCESSFUL</b> 🚀\n\nThe Chat ID (${chatId}) was successfully extracted and linked! WideWear will now send order and technical notifications directly to this chat.`;

async function testBot() {
    try {
        console.log(`Sending test message to Chat ID: ${chatId}`);
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
            }),
        });

        if (res.ok) {
            console.log("✅ Message sent successfully!");
        } else {
            console.error("❌ Failed to send message:", await res.text());
        }
    } catch (err) {
        console.error("❌ Error sending message:", err);
    }
}

testBot();
