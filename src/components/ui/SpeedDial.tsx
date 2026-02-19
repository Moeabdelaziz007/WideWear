"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Phone, X } from "lucide-react";
import { useLocale } from "next-intl";

export default function SpeedDial() {
    const locale = useLocale();
    const isRTL = locale === "ar";
    const [isOpen, setIsOpen] = useState(false);

    const telegramBot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "WideWear_Bot";
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+201000000000";
    const messengerLink = process.env.NEXT_PUBLIC_MESSENGER_LINK || "WideWear";

    const CHANNELS = [
        {
            id: "telegram",
            icon: Send,
            color: "bg-[#2AABEE]",
            href: `https://t.me/${telegramBot}`,
            label: isRTL ? "تليجرام" : "Telegram",
        },
        {
            id: "whatsapp",
            icon: Phone,
            color: "bg-[#25D366]",
            href: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`,
            label: isRTL ? "واتساب" : "WhatsApp",
        },
        {
            id: "messenger",
            icon: MessageCircle,
            color: "bg-[#00B2FF]",
            href: `https://m.me/${messengerLink}`,
            label: isRTL ? "ماسنجر" : "Messenger",
        }
    ];

    return (
        <div className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-50 flex flex-col items-center gap-3`}>
            {/* Expanded Channels */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-3"
                    >
                        {CHANNELS.map((channel, i) => (
                            <motion.a
                                key={channel.id}
                                href={channel.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 ${channel.color}`}
                                title={channel.label}
                                aria-label={channel.label}
                            >
                                <channel.icon className="h-5 w-5" />
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--wide-neon)] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-colors hover:bg-[var(--wide-neon-dim)]"
                aria-label={isRTL ? "تواصل معنا" : "Contact Us"}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="h-6 w-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <MessageCircle className="h-6 w-6 fill-black" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
