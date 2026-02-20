-- WideWear Database Schema
-- Phase A: Core e-commerce tables
-- ============================================================
-- 1. Products Catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    category TEXT NOT NULL CHECK (
        category IN (
            'hoodie',
            'jacket',
            'pants',
            'abaya',
            'shoes',
            'accessory',
            'set'
        )
    ),
    sizes TEXT [] DEFAULT '{}',
    colors JSONB DEFAULT '[]',
    images TEXT [] DEFAULT '{}',
    badge TEXT CHECK (
        badge IN (
            'NEW',
            'HOT',
            'SALE',
            'RAMADAN',
            'EXCLUSIVE',
            NULL
        )
    ),
    stock INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- Everyone can read active products
CREATE POLICY "Public can read active products" ON products FOR
SELECT USING (is_active = true);
-- ============================================================
-- 2. Customer Profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT DEFAULT 'Cairo',
    locale TEXT DEFAULT 'ar',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Users can only view/edit their own profile
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (id, full_name, avatar_url)
VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ============================================================
-- 3. Shopping Cart (persistent per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id, size, color)
);
-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
-- Users can only access their own cart
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
-- ============================================================
-- 4. Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'shipped',
            'delivered',
            'cancelled'
        )
    ),
    total DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    phone TEXT NOT NULL,
    payment_method TEXT DEFAULT 'cod' CHECK (
        payment_method IN ('cod', 'card', 'fawry', 'vodafone_cash')
    ),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Users can view their own orders
CREATE POLICY "Users view own orders" ON orders FOR
SELECT USING (auth.uid() = user_id);
-- Users can create orders
CREATE POLICY "Users create orders" ON orders FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- ============================================================
-- 5. Order Items (snapshot of product at purchase time)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    size TEXT NOT NULL,
    color TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    image_url TEXT
);
-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- Users can view items for their own orders
CREATE POLICY "Users view own order items" ON order_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM orders
            WHERE orders.id = order_items.order_id
                AND orders.user_id = auth.uid()
        )
    );
-- ============================================================
-- 6. Seed: Initial Products (from current hardcoded data)
-- ============================================================
INSERT INTO products (
        name_ar,
        name_en,
        price,
        sale_price,
        category,
        sizes,
        colors,
        images,
        badge,
        stock,
        rating,
        reviews_count
    )
VALUES (
        'هودي أوفرسايز أسود',
        'Oversized Black Hoodie',
        899.00,
        699.00,
        'hoodie',
        ARRAY ['S','M','L','XL','XXL'],
        '[{"name":"أسود","hex":"#1a1a1a"},{"name":"رمادي","hex":"#4a4a4a"}]'::jsonb,
        ARRAY ['/products/IMG_0575.jpg'],
        'HOT',
        45,
        4.8,
        128
    ),
    (
        'جاكيت بومبر عسكري',
        'Military Bomber Jacket',
        1299.00,
        NULL,
        'jacket',
        ARRAY ['M','L','XL','XXL'],
        '[{"name":"زيتي","hex":"#4a5f3a"},{"name":"أسود","hex":"#1a1a1a"}]'::jsonb,
        ARRAY ['/products/IMG_0576.jpg'],
        'NEW',
        30,
        4.6,
        89
    ),
    (
        'بنطلون كارجو واسع',
        'Wide Cargo Pants',
        749.00,
        599.00,
        'pants',
        ARRAY ['S','M','L','XL'],
        '[{"name":"بيج","hex":"#c4b19a"},{"name":"أسود","hex":"#1a1a1a"}]'::jsonb,
        ARRAY ['/products/IMG_0579.jpg'],
        'SALE',
        60,
        4.5,
        203
    ),
    (
        'عباية رمضان سوداء',
        'Ramadan Black Abaya',
        1599.00,
        NULL,
        'abaya',
        ARRAY ['S','M','L','XL'],
        '[{"name":"أسود","hex":"#0a0a0a"}]'::jsonb,
        ARRAY ['/products/IMG_0580.jpg'],
        'RAMADAN',
        25,
        4.9,
        67
    ),
    (
        'سنيكرز ستريت أبيض',
        'White Street Sneakers',
        1199.00,
        999.00,
        'shoes',
        ARRAY ['40','41','42','43','44','45'],
        '[{"name":"أبيض","hex":"#f5f5f5"},{"name":"أسود","hex":"#1a1a1a"}]'::jsonb,
        ARRAY ['/products/IMG_0737.jpg','/products/IMG_0738.jpg'],
        'EXCLUSIVE',
        35,
        4.7,
        156
    ),
    (
        'هودي نيون أخضر',
        'Neon Green Hoodie',
        949.00,
        NULL,
        'hoodie',
        ARRAY ['S','M','L','XL'],
        '[{"name":"أخضر نيون","hex":"#39ff14"},{"name":"أسود","hex":"#1a1a1a"}]'::jsonb,
        ARRAY ['/products/IMG_0740.jpg'],
        'NEW',
        20,
        4.4,
        42
    ),
    (
        'طقم رياضي كامل',
        'Full Tracksuit Set',
        1899.00,
        1499.00,
        'set',
        ARRAY ['M','L','XL','XXL'],
        '[{"name":"رمادي","hex":"#4a4a4a"},{"name":"أسود","hex":"#1a1a1a"}]'::jsonb,
        ARRAY ['/products/IMG_0742.jpg','/products/IMG_0744.jpg'],
        'HOT',
        15,
        4.8,
        94
    ),
    (
        'حذاء رياضي أسود',
        'Black Sport Shoes',
        1099.00,
        NULL,
        'shoes',
        ARRAY ['40','41','42','43','44'],
        '[{"name":"أسود","hex":"#1a1a1a"}]'::jsonb,
        ARRAY ['/products/IMG_0751.jpg','/products/IMG_0754.jpg','/products/IMG_0756.jpg'],
        NULL,
        40,
        4.3,
        71
    );
-- ============================================================
-- 7. Updated timestamp trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER products_updated_at BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();