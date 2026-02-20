"use client";

import { useRef, useState, ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MagneticWrapperProps {
    children: ReactElement;
    strength?: number;      // How much the element moves
    radius?: number;        // Within what radius the magnetic effect triggers
}

export function MagneticWrapper({ children, strength = 40 }: MagneticWrapperProps) {
    const ref = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (prefersReducedMotion || !ref.current) return;

        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // Apply magnetic pull only if within a certain radius, OR scale based on distance
        setPosition({
            x: distanceX * (strength / 100),
            y: distanceY * (strength / 100),
        });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    if (prefersReducedMotion) {
        return <>{children}</>;
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="inline-flex"
        >
            {children}
        </motion.div>
    );
}
