-- =============================================
-- EXPENSE TRACKER - SUPABASE DATABASE SETUP
-- =============================================
-- Run these commands in your Supabase SQL Editor
-- =============================================

-- Note: Row Level Security is automatically configured by Supabase

-- =============================================
-- 1. USERS TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);
CREATE INDEX IF NOT EXISTS transactions_category_idx ON public.transactions(category);

-- =============================================
-- 3. SAVINGS GOALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12, 2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for savings_goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own savings goals
CREATE POLICY "Users can view own savings goals" ON public.savings_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals" ON public.savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" ON public.savings_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" ON public.savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX IF NOT EXISTS savings_goals_user_id_idx ON public.savings_goals(user_id);

-- =============================================
-- 4. CATEGORIES TABLE (Optional - for predefined categories)
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT DEFAULT '#64748b',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO public.categories (name, type, color, icon) VALUES
    ('Food & Dining', 'expense', '#ef4444', '🍽️'),
    ('Transportation', 'expense', '#f97316', '🚗'),
    ('Shopping', 'expense', '#eab308', '🛍️'),
    ('Entertainment', 'expense', '#22c55e', '🎬'),
    ('Bills & Utilities', 'expense', '#3b82f6', '💡'),
    ('Healthcare', 'expense', '#a855f7', '🏥'),
    ('Education', 'expense', '#06b6d4', '📚'),
    ('Travel', 'expense', '#ec4899', '✈️'),
    ('Groceries', 'expense', '#84cc16', '🛒'),
    ('Other', 'expense', '#64748b', '📦');

-- Insert default income categories
INSERT INTO public.categories (name, type, color, icon) VALUES
    ('Salary', 'income', '#22c55e', '💼'),
    ('Freelance', 'income', '#3b82f6', '💻'),
    ('Investment', 'income', '#a855f7', '📈'),
    ('Business', 'income', '#f59e0b', '🏢'),
    ('Gift', 'income', '#ec4899', '🎁'),
    ('Bonus', 'income', '#10b981', '💰');

-- Enable public read access to categories (no RLS needed)
-- Categories are shared across all users

-- =============================================
-- 5. FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
    BEFORE UPDATE ON public.savings_goals
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =============================================
-- 6. VIEWS FOR ANALYTICS (Optional)
-- =============================================

-- View for monthly transaction summaries
CREATE OR REPLACE VIEW public.monthly_summaries AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM public.transactions
GROUP BY user_id, DATE_TRUNC('month', date), type
ORDER BY month DESC;

-- View for category summaries
CREATE OR REPLACE VIEW public.category_summaries AS
SELECT 
    user_id,
    category,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count,
    AVG(amount) as avg_amount
FROM public.transactions
GROUP BY user_id, category, type
ORDER BY total_amount DESC;

-- =============================================
-- 7. SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment these lines if you want to add sample data
-- Make sure to replace 'your-user-id' with an actual user UUID

/*
-- Sample transactions
INSERT INTO public.transactions (user_id, type, amount, category, description, date) VALUES
    ('your-user-id', 'expense', 45.80, 'Food & Dining', 'Lunch at downtown cafe', CURRENT_DATE),
    ('your-user-id', 'income', 2500.00, 'Salary', 'Monthly salary', CURRENT_DATE - INTERVAL '1 day'),
    ('your-user-id', 'expense', 89.99, 'Shopping', 'Online purchase', CURRENT_DATE - INTERVAL '1 day'),
    ('your-user-id', 'expense', 15.00, 'Transportation', 'Uber ride', CURRENT_DATE - INTERVAL '2 days');

-- Sample savings goals
INSERT INTO public.savings_goals (user_id, title, target_amount, current_amount, deadline, color) VALUES
    ('your-user-id', 'Emergency Fund', 10000.00, 6500.00, '2024-12-31', '#3b82f6'),
    ('your-user-id', 'Vacation Fund', 3000.00, 1200.00, '2024-06-30', '#06b6d4'),
    ('your-user-id', 'New Car', 25000.00, 8500.00, '2025-03-31', '#22c55e');
*/

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- 
-- Next steps:
-- 1. Copy your Supabase URL and Anon Key
-- 2. Add them to your .env file
-- 3. Update your app to use Supabase instead of localStorage
-- 
-- =============================================
