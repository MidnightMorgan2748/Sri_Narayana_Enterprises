-- ============================================================================
-- SRI NARAYANA ENTERPRISES - SUPABASE ENTERPRISE-GRADE DATABASE SCHEMA
-- ============================================================================

-- Drop existing tables first in proper dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_tracking CASCADE;
DROP TABLE IF EXISTS customer_history CASCADE;
DROP TABLE IF EXISTS price_updates CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS paint_shades CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE (Linked with Supabase Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Must match auth.users.id
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 1.1 ADMIN_USERS TABLE (Synchronized mirrors for administration and access directories)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE
CREATE TABLE products (
    id TEXT PRIMARY KEY, -- e.g., 'paint_halo_4L', 'cement_opc', 'rod_12mm'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('paint', 'putty', 'cement', 'rod')),
    price NUMERIC NOT NULL DEFAULT 0,
    image TEXT, -- Base64 or placeholder url representation
    stock INTEGER NOT NULL DEFAULT 100,
    size TEXT NOT NULL, -- '1L', '4L', '20 KG', '50 KG Bag', '12mm Bar', etc
    brand TEXT NOT NULL, -- 'JSW', 'KCP', 'SNE TMT'
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. PAINT_SHADES TABLE (Official Extracted JSW Colours)
CREATE TABLE paint_shades (
    id SERIAL PRIMARY KEY,
    shade_code TEXT UNIQUE NOT NULL, -- e.g. '1093', '3154'
    shade_name TEXT NOT NULL, -- e.g. 'Pebble’s Sound', 'Story Telling'
    category TEXT NOT NULL, -- e.g. 'Right Whites', 'Fresh Pastels', 'Modern Midtones', 'Smart Neutrals', 'Bold Accents'
    color_family TEXT NOT NULL, -- e.g. 'White', 'Yellow', 'Orange', 'Red', 'Pink', 'Blue', 'Green', 'Brown', 'Grey', 'Violet'
    hex_color TEXT NOT NULL, -- e.g. '#F3EFE0'
    image_url TEXT, -- Dynamic base64 SVG representation
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE paint_shades ENABLE ROW LEVEL SECURITY;

-- 4. ORDERS TABLE (Purchase portfolios)
CREATE TABLE orders (
    id TEXT PRIMARY KEY, -- e.g., 'SNE-129384'
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    items JSONB NOT NULL, -- Array of items: name, shade, price, quantity, size
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'packed', 'dispatched', 'delivered')),
    email_sent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
 );
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. CART_ITEMS TABLE
CREATE TABLE cart_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 6. CATEGORIES TABLE
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 7. INVENTORY TABLE
CREATE TABLE inventory (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- 8. ENQUIRIES TABLE (procurement center inquiries)
CREATE TABLE enquiries (
    id TEXT PRIMARY KEY, -- 'LEAD-10291'
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    project_location TEXT NOT NULL,
    material_requirement TEXT NOT NULL,
    budget TEXT NOT NULL,
    comments TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'negotiating', 'won', 'lost')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 9. REVIEWS TABLE
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    role TEXT DEFAULT 'Client',
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 10. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 11. ORDER TRACKING MODULE
CREATE TABLE order_tracking (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- 12. CUSTOMER HISTORY LINKAGE
CREATE TABLE customer_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL, -- mobile or email
    order_id TEXT NOT NULL
);
ALTER TABLE customer_history ENABLE ROW LEVEL SECURITY;

-- 13. LIVE PRICE UPDATES
CREATE TABLE price_updates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL,
    old_price NUMERIC NOT NULL,
    new_price NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE price_updates ENABLE ROW LEVEL SECURITY;

-- 14. GALLEY MANAGER IMAGES
CREATE TABLE gallery (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR FULL PUBLIC ANONYMOUS/AUTHORIZED FLOWS
-- ============================================================================

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert admin_users" ON admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update admin_users" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete admin_users" ON admin_users FOR DELETE USING (true);

CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public all products" ON products FOR ALL USING (true);

CREATE POLICY "Allow public read paint_shades" ON paint_shades FOR SELECT USING (true);
CREATE POLICY "Allow public all paint_shades" ON paint_shades FOR ALL USING (true);

CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON orders FOR DELETE USING (true);

CREATE POLICY "Allow public cart_items" ON cart_items FOR ALL USING (true);
CREATE POLICY "Allow public categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow public inventory" ON inventory FOR ALL USING (true);

CREATE POLICY "Allow public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select enquiries" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Allow public update enquiries" ON enquiries FOR UPDATE USING (true);

CREATE POLICY "Allow public select reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update reviews" ON reviews FOR ALL USING (true);

CREATE POLICY "Allow public notifications" ON notifications FOR ALL USING (true);

CREATE POLICY "Allow public order_tracking" ON order_tracking FOR ALL USING (true);
CREATE POLICY "Allow public customer_history" ON customer_history FOR ALL USING (true);
CREATE POLICY "Allow public price_updates" ON price_updates FOR ALL USING (true);
CREATE POLICY "Allow public gallery" ON gallery FOR ALL USING (true);


-- ============================================================================
-- INITIAL DATA SEEDING (EXACT JSW SHADES, PRODUCTS, & ACCOUNTS)
-- ============================================================================

-- Seed Owners Accounts in users
INSERT INTO users (id, email, role, full_name, is_active) VALUES
('b80461bf-ee21-4f1a-b333-e18e6cb0f455', 'venkateshkarnati16@gmail.com', 'super_admin', 'Venkatesh Karnati', true),
('a59cbdef-f123-4c56-b789-d123e45f6789', 'tamatamnarayana9@gmail.com', 'super_admin', 'Tamatam Narayana', true),
('c73dbdef-f456-4c78-b901-e234e56f7890', 'draghureddy2748@gmail.com', 'admin', 'Raghu Reddy', true)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- Seed Owners Accounts in admin_users
INSERT INTO admin_users (id, email, role, full_name, is_active) VALUES
('b80461bf-ee21-4f1a-b333-e18e6cb0f455', 'venkateshkarnati16@gmail.com', 'super_admin', 'Venkatesh Karnati', true),
('a59cbdef-f123-4c56-b789-d123e45f6789', 'tamatamnarayana9@gmail.com', 'super_admin', 'Tamatam Narayana', true),
('c73dbdef-f456-4c78-b901-e234e56f7890', 'draghureddy2748@gmail.com', 'admin', 'Raghu Reddy', true)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- Seed Categories
INSERT INTO categories (id, name, description) VALUES
('paint', 'JSW Paints Emulsions', 'Computerized color tinting matching luxury emulsions'),
('putty', 'Wall Putty Basecoats', 'Premium surface levelers and water-resistant makkus'),
('cement', 'KCP Cement Bags', 'High-durability OPC 53 Grade and PPC plastering cement'),
('rod', 'Reinforcement Material Rods', 'High-tensile premium Fe-550D TMT reinforcement steel bars')
ON CONFLICT (id) DO NOTHING;

-- Seed Exact Products (from Price List & Catalogs)
INSERT INTO products (id, name, description, category, price, image, stock, size, brand) VALUES
-- JSW Emulsions Sizing
('paint_1L', 'JSW Paints Emulsions Pack', 'JSW premium base, computer tinted', 'paint', 280, '', 500, '1L', 'JSW'),
('paint_4L', 'JSW Paints Emulsions Pack', 'JSW premium base, computer tinted', 'paint', 1050, '', 300, '4L', 'JSW'),
('paint_10L', 'JSW Paints Emulsions Pack', 'JSW premium base, computer tinted', 'paint', 2450, '', 150, '10L', 'JSW'),
('paint_20L', 'JSW Paints Emulsions Pack', 'JSW premium base, computer tinted', 'paint', 4700, '', 100, '20L', 'JSW'),
('paint_50L', 'JSW Paints Emulsions Pack', 'JSW premium base, computer tinted', 'paint', 11000, '', 50, '50L', 'JSW'),

-- Wall Putty Sizing
('putty_White Wall Putty_20 KG', 'White Wall Putty', 'High coverage plaster smoothing putty', 'putty', 620, '', 200, '20 KG', 'JSW'),
('putty_White Wall Putty_25 KG', 'White Wall Putty', 'High coverage plaster smoothing putty', 'putty', 760, '', 150, '25 KG', 'JSW'),
('putty_White Wall Putty_40 KG', 'White Wall Putty', 'High coverage plaster smoothing putty', 'putty', 1150, '', 100, '40 KG', 'JSW'),
('putty_Premium Wall Putty_20 KG', 'Premium Wall Putty', 'Enhanced water repellent and smooth finish putty', 'putty', 750, '', 180, '20 KG', 'JSW'),
('putty_Premium Wall Putty_25 KG', 'Premium Wall Putty', 'Enhanced water repellent and smooth finish putty', 'putty', 910, '', 140, '25 KG', 'JSW'),
('putty_Premium Wall Putty_40 KG', 'Premium Wall Putty', 'Enhanced water repellent and smooth finish putty', 'putty', 1380, '', 80, '40 KG', 'JSW'),
('putty_Waterproof Wall Putty_20 KG', 'Waterproof Wall Putty', 'Superb silicone-infused anti-washout waterproof base', 'putty', 880, '', 150, '20 KG', 'JSW'),
('putty_Waterproof Wall Putty_25 KG', 'Waterproof Wall Putty', 'Superb silicone-infused anti-washout waterproof base', 'putty', 1080, '', 110, '25 KG', 'JSW'),
('putty_Waterproof Wall Putty_40 KG', 'Waterproof Wall Putty', 'Superb silicone-infused anti-washout waterproof base', 'putty', 1650, '', 60, '40 KG', 'JSW'),

-- KCP Cements Grade Sizing
('cement_KCP OPC 53 Grade', 'KCP OPC 53 Grade Cement', 'Ideal for columns, slabs, and heavy structural foundations', 'cement', 480, '', 400, '50 KG Bag', 'KCP'),
('cement_KCP PPC Cement', 'KCP PPC Cement', 'Optimal for brickwork, joint mortar, and high-coverage plastering', 'cement', 440, '', 600, '50 KG Bag', 'KCP'),

-- TMT Steel Rods Structural bars 12m length
('rod_6mm', 'TMT Steel Rod 6mm', 'Reinforcing stirrups and mesh framing rebar', 'rod', 210, '', 120, '6mm Bar', 'SNE TMT'),
('rod_8mm', 'TMT Steel Rod 8mm', 'Reinforcing stirrups and mesh framing rebar', 'rod', 350, '', 180, '8mm Bar', 'SNE TMT'),
('rod_10mm', 'TMT Steel Rod 10mm', 'Structural support distribution framing rebar', 'rod', 520, '', 220, '10mm Bar', 'SNE TMT'),
('rod_12mm', 'TMT Steel Rod 12mm', 'Heavy tensile frame support rebar', 'rod', 750, '', 250, '12mm Bar', 'SNE TMT'),
('rod_16mm', 'TMT Steel Rod 16mm', 'Heavy columns and highrise load bearing rebar', 'rod', 1320, '', 150, '16mm Bar', 'SNE TMT'),
('rod_20mm', 'TMT Steel Rod 20mm', 'Critical foundation and heavy bridge load structural rebar', 'rod', 2070, '', 100, '20mm Bar', 'SNE TMT'),
('rod_25mm', 'TMT Steel Rod 25mm', 'Mega-structure ultra-tensile engineering grade rebar', 'rod', 3350, '', 80, '25mm Bar', 'SNE TMT'),
('rod_32mm', 'TMT Steel Rod 32mm', 'Industrial heavy-foundation structural grade rebar', 'rod', 5400, '', 50, '32mm Bar', 'SNE TMT')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

-- Seed Paint Shades (JSW Shade Card PDFs - Real 100% extracted shades)
INSERT INTO paint_shades (shade_code, shade_name, category, color_family, hex_color, image_url) VALUES
('1093', 'Pebble’s Sound', 'Right Whites', 'White', '#F3EFE0', ''),
('1112', 'Wing Shimmer', 'Right Whites', 'White', '#FCF8F4', ''),
('1096', 'Clotted Crème', 'Right Whites', 'White', '#FAF5E1', ''),
('1114', 'Calm Breeze', 'Right Whites', 'White', '#FBF3DE', ''),
('1097', 'Convent Lace', 'Right Whites', 'White', '#FAF5DD', ''),
('1117', 'Fountain’s Pool', 'Right Whites', 'White', '#FFFDF2', ''),
('1127', 'Milk of Ambrosia', 'Right Whites', 'Orange', '#FFF1DF', ''),
('1135', 'Alabaster Shell', 'Right Whites', 'Orange', '#FFEADA', ''),
('1196', 'Stray Light', 'Right Whites', 'White', '#FAF8F5', ''),
('1021', 'Snow Drift', 'Right Whites', 'White', '#F7F9FA', ''),
('1057', 'Shore Side Haze', 'Right Whites', 'White', '#F5F5ED', ''),
('1024', 'Winter Time', 'Right Whites', 'White', '#EFF3EF', ''),
('1066', 'Antique Pearl', 'Right Whites', 'White', '#F7F5EA', ''),
('1156', 'Himalayan Air', 'Right Whites', 'White', '#F3EEF5', ''),
('1058', 'Homestead Beige', 'Right Whites', 'White', '#F2EDE2', ''),
('1016', 'Peace Plaza', 'Right Whites', 'White', '#EDF2E8', ''),

('2043', 'Champagne Glass', 'Fresh Pastels', 'Yellow', '#FDF1D5', ''),
('2038', 'Happy Time', 'Fresh Pastels', 'Yellow', '#E8F086', ''),
('2046', 'Morning Mimosa', 'Fresh Pastels', 'Yellow', '#FFE59E', ''),
('2054', 'Wood Shaving', 'Fresh Pastels', 'Yellow', '#D6D99C', ''),
('2091', 'Fresh Aroma', 'Fresh Pastels', 'Yellow', '#FAF2D5', ''),
('2095', 'Warm Crust', 'Fresh Pastels', 'Yellow', '#FBE6BE', ''),
('2221', 'Kiss of Light', 'Fresh Pastels', 'Yellow', '#FFF3DC', ''),
('2295', 'Sensual Silk', 'Fresh Pastels', 'Pink', '#F9D5CE', ''),
('2312', 'Garden Flowers', 'Fresh Pastels', 'Pink', '#FFD0D9', ''),
('2307', 'Floating Parasol', 'Fresh Pastels', 'Pink', '#F0B5CE', ''),
('2385', 'Marine Drive', 'Fresh Pastels', 'Blue', '#CAD6ED', ''),
('2398', 'Beach Side', 'Fresh Pastels', 'Blue', '#A8BBE5', ''),
('2464', 'Ripple of Rain', 'Fresh Pastels', 'Blue', '#ACD2E2', ''),
('2466', 'Flight of Pigeons', 'Fresh Pastels', 'Blue', '#C7E5EC', ''),
('2604', 'Scented Eucalyptus', 'Fresh Pastels', 'Green', '#AEDBA7', ''),
('2687', 'Nutty Season', 'Fresh Pastels', 'Green', '#E7ECB4', ''),

('3032', 'Jaipur Gate', 'Modern Midtones', 'Yellow', '#CCCA91', ''),
('3016', 'Dancing Girl', 'Modern Midtones', 'Yellow', '#D8BF50', ''),
('3054', 'Jai Mandir', 'Modern Midtones', 'Yellow', '#CDBC72', ''),
('3056', 'Patina Gold', 'Modern Midtones', 'Yellow', '#F6C561', ''),
('3093', 'Rock Plaster', 'Modern Midtones', 'Brown', '#C4AC79', ''),
('3156', 'Madhubani Orange', 'Modern Midtones', 'Orange', '#FA9D6D', ''),
('3154', 'Story Telling', 'Modern Midtones', 'Orange', '#FCA45A', ''),
('3216', 'Rose Madder', 'Modern Midtones', 'Red', '#E96C61', ''),
('3212', 'Organic Dye', 'Modern Midtones', 'Brown', '#D6B794', ''),
('3275', 'Amethyst Cluster', 'Modern Midtones', 'Pink', '#B8838B', ''),
('3292', 'City Lore', 'Modern Midtones', 'Grey', '#DFCDBC', ''),
('3354', 'Divine Blue', 'Modern Midtones', 'Blue', '#94AEBA', ''),
('3404', 'Graceful Run', 'Modern Midtones', 'Green', '#AEBFAF', ''),
('3444', 'Sailing Tide', 'Modern Midtones', 'Green', '#91C8AD', ''),
('3615', 'Tea Tasting', 'Modern Midtones', 'Green', '#CCD7AD', ''),
('3596', 'Pagoda Green', 'Modern Midtones', 'Green', '#BCD449', ''),

('3037', 'Battlement', 'Modern Midtones', 'Yellow', '#CCAF35', ''),
('3066', 'Hidden Cove', 'Modern Midtones', 'Yellow', '#CCA330', ''),
('3076', 'Pagoda Roof', 'Modern Midtones', 'Yellow', '#EAA61E', ''),
('3097', 'Maze of Lanes', 'Modern Midtones', 'Yellow', '#D69F21', ''),
('3158', 'Natural Pigment', 'Modern Midtones', 'Orange', '#C96D2D', ''),
('3187', 'Dark Umber', 'Modern Midtones', 'Brown', '#834A42', ''),
('3198', 'Inner City Walls', 'Modern Midtones', 'Red', '#B8543B', ''),
('3207', 'Classic Red', 'Modern Midtones', 'Red', '#9E1917', ''),
('3268', 'Velvet Field', 'Modern Midtones', 'Red', '#9E2954', ''),
('3306', 'Kings Mantle', 'Modern Midtones', 'Violet', '#C599D9', ''),
('3347', 'Majorelle Ceramic', 'Modern Midtones', 'Blue', '#7E8AA3', ''),
('3357', 'Gopurum Gate', 'Modern Midtones', 'Blue', '#4A6380', ''),
('3406', 'Water Canal', 'Modern Midtones', 'Blue', '#94B5B2', ''),
('3388', 'Ebb and Tide', 'Modern Midtones', 'Blue', '#3B6E6A', ''),
('3555', 'Monsoon Green', 'Modern Midtones', 'Green', '#5EA95C', ''),
('3487', 'Ocean Deep', 'Modern Midtones', 'Green', '#4A6E55', ''),

('4061', 'Transcript', 'Smart Neutrals', 'Grey', '#E1DACF', ''),
('4111', 'Light Within', 'Smart Neutrals', 'White', '#EFE8DC', ''),
('4063', 'Papyrus', 'Smart Neutrals', 'Yellow', '#CBC4A3', ''),
('4112', 'Lapsed Time', 'Smart Neutrals', 'Yellow', '#DFD2B5', ''),
('4075', 'Dense Thicket', 'Smart Neutrals', 'Green', '#8A7942', ''),
('4093', 'Riviera Sand', 'Smart Neutrals', 'Yellow', '#C9BF9E', ''),
('4067', 'Composition', 'Smart Neutrals', 'Brown', '#5F4D32', ''),
('4356', 'Red Ore', 'Smart Neutrals', 'Red', '#A6513A', ''),
('4292', 'Still Quiet', 'Smart Neutrals', 'Green', '#E7F5D6', ''),
('4222', 'Elemental Sheen', 'Smart Neutrals', 'Green', '#CEDCC4', ''),
('4294', 'Inner View', 'Smart Neutrals', 'Green', '#A2A77B', ''),
('4264', 'Rushing Wave', 'Smart Neutrals', 'Green', '#CDD4B4', ''),
('4394', 'Sustainability Now', 'Smart Neutrals', 'Green', '#7E901F', ''),
('4267', 'Endless Sound', 'Smart Neutrals', 'Green', '#637666', ''),
('4295', 'Therapy Green', 'Smart Neutrals', 'Green', '#95A26B', ''),
('4385', 'Next Crest', 'Smart Neutrals', 'Green', '#466543', ''),

('5026', 'Brocade Bravado', 'Bold Accents', 'Yellow', '#EAB01D', ''),
('5034', 'Temple Of The Sun', 'Bold Accents', 'Yellow', '#F9B80F', ''),
('5077', 'Rusty Hue', 'Bold Accents', 'Orange', '#DC591E', ''),
('5086', 'Halon Wash', 'Bold Accents', 'Red', '#FC3A07', ''),
('5132', 'Smart Pink', 'Bold Accents', 'Pink', '#E3066C', ''),
('5125', 'Take The Stage', 'Bold Accents', 'Red', '#DC0B24', ''),
('5161', 'Leader Of The Pink', 'Bold Accents', 'Pink', '#EA1280', ''),
('5163', 'Daddy’s Girl', 'Bold Accents', 'Pink', '#D60C72', ''),
('5182', 'Nectar In A Sieve', 'Bold Accents', 'Pink', '#E74FEA', ''),
('5174', 'Fauvelot Color', 'Bold Accents', 'Pink', '#B83D6D', ''),
('5192', 'Blue Rain', 'Bold Accents', 'Violet', '#6951C2', ''),
('5207', 'While It Lasts', 'Bold Accents', 'Blue', '#222C74', ''),
('5252', 'Enchantment Tokyo', 'Bold Accents', 'Green', '#0BC672', ''),
('5225', 'Good Time', 'Bold Accents', 'Green', '#0EA484', ''),
('5305', 'In The Limelight', 'Bold Accents', 'Yellow', '#EBE312', ''),
('5315', 'I’m Happy Now', 'Bold Accents', 'Yellow', '#E6DC17', '')
ON CONFLICT (shade_code) DO NOTHING;

-- Seed price_updates with historical & current rates as requested
INSERT INTO price_updates (id, category, old_price, new_price, updated_at) VALUES
('pr-1', 'paint', 1000, 1050, now() - interval '2 days'),
('pr-2', 'putty', 1100, 1150, now() - interval '1 days'),
('pr-3', 'cement', 450, 480, now()),
('pr-4', 'steel', 720, 750, now());

-- Seed gallery with gorgeous regional project representation
INSERT INTO gallery (id, image, category, uploaded_at) VALUES
('g-1', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80', 'House Painting', now() - interval '10 days'),
('g-2', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', 'House Painting', now() - interval '9 days'),
('g-3', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80', 'Commercial Projects', now() - interval '6 days'),
('g-4', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80', 'Cement Deliveries', now() - interval '5 days'),
('g-5', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80', 'Steel Deliveries', now() - interval '3 days'),
('g-6', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80', 'Shop Photos', now() - interval '1 days');


GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
