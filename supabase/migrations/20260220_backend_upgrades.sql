-- WideWear Database Backend Upgrades
-- Phase 1: Advanced Security, RBAC, and Atomic Transactions
-- ============================================================
-- 1. Role-Based Access Control (RBAC) setup
-- Add `role` to the profiles table to identify admins effortlessly
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
-- Set default users to 'admin' right now if needed, or rely on a specific user update
-- (This should be handled manually by the store owner for the first admin)
-- ============================================================
-- 2. Enhanced RLS Policies (Products, Orders, Profiles)
-- ============================================================
-- Products: Admins can manage everything, Users can read active only
DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Anyone can read active products" ON products FOR
SELECT USING (is_active = true);
CREATE POLICY "Admins have full access to products" ON products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
    )
);
-- Profiles: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
    );
-- Orders: Admins can manage all orders
CREATE POLICY "Admins manage all orders" ON orders FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
    )
);
-- ============================================================
-- 3. Atomic Order Creation (RPC / Stored Procedure)
-- ============================================================
-- This function guarantees that when a user checks out, stock is verified
-- securely on the server side, and the order is inserted in a single transaction.
CREATE OR REPLACE FUNCTION checkout_order (
        p_user_id UUID,
        p_shipping_address JSONB,
        p_phone TEXT,
        p_payment_method TEXT,
        p_shipping_method TEXT,
        p_notes TEXT DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_order_id UUID;
v_total DECIMAL(10, 2) := 0;
v_cart_item RECORD;
v_product RECORD;
BEGIN -- Ensure the user actually has items in the cart
IF NOT EXISTS (
    SELECT 1
    FROM cart_items
    WHERE user_id = p_user_id
) THEN RAISE EXCEPTION 'Cart is empty. Cannot create order.';
END IF;
-- Create pending order skeleton
INSERT INTO orders (
        user_id,
        status,
        total,
        shipping_address,
        phone,
        payment_method,
        shipping_method,
        notes
    )
VALUES (
        p_user_id,
        'pending',
        0,
        p_shipping_address,
        p_phone,
        p_payment_method,
        p_shipping_method,
        p_notes
    )
RETURNING id INTO v_order_id;
-- Iterate through the cart, lock rows for update to prevent race conditions
FOR v_cart_item IN (
    SELECT *
    FROM cart_items
    WHERE user_id = p_user_id FOR
    UPDATE
) LOOP -- Fetch the actual product and lock it
SELECT * INTO v_product
FROM products
WHERE id = v_cart_item.product_id FOR
UPDATE;
IF NOT FOUND
OR NOT v_product.is_active THEN RAISE EXCEPTION 'Product % is no longer available.',
v_cart_item.product_id;
END IF;
IF v_product.stock < v_cart_item.quantity THEN RAISE EXCEPTION 'Insufficient stock for product % (Available: %)',
v_product.name_en,
v_product.stock;
END IF;
-- Deduct stock safely
UPDATE products
SET stock = stock - v_cart_item.quantity,
    updated_at = now()
WHERE id = v_product.id;
-- Determine the active price (sale vs regular)
DECLARE v_item_price DECIMAL(10, 2) := COALESCE(v_product.sale_price, v_product.price);
BEGIN -- Insert into order items
INSERT INTO order_items (
        order_id,
        product_id,
        name_ar,
        name_en,
        price,
        size,
        color,
        quantity,
        image_url
    )
VALUES (
        v_order_id,
        v_product.id,
        v_product.name_ar,
        v_product.name_en,
        v_item_price,
        v_cart_item.size,
        v_cart_item.color,
        v_cart_item.quantity,
        v_product.images [1] -- First image as thumbnail
    );
-- Accumulate total safely on server
v_total := v_total + (v_item_price * v_cart_item.quantity);
END;
END LOOP;
-- Update the order with the calculated total
UPDATE orders
SET total = v_total
WHERE id = v_order_id;
-- Clear the user's cart
DELETE FROM cart_items
WHERE user_id = p_user_id;
RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================
-- 4. Advanced Indexing (Performance Optimization)
-- ============================================================
-- Fast lookup for products page based on category and active status
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);
-- Fast lookup for user's orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
-- GIN index for fast JSONB querying (colors)
CREATE INDEX IF NOT EXISTS idx_products_colors_gin ON products USING gin(colors);