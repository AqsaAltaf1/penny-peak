-- =============================================
-- EMAIL CHECK FUNCTION FOR SUPABASE
-- =============================================
-- Run this in your Supabase SQL Editor
-- =============================================

-- Function to check if email exists in auth.users table
-- This function runs with elevated privileges (SECURITY DEFINER)
-- and can access the auth.users table even when called from the frontend
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    result JSON;
BEGIN
    -- Query the auth.users table directly
    SELECT id, email, email_confirmed_at
    INTO user_record
    FROM auth.users
    WHERE email = email_to_check
    LIMIT 1;
    
    -- If user found, return their info
    IF FOUND THEN
        result := json_build_object(
            'exists', true,
            'confirmed', user_record.email_confirmed_at IS NOT NULL,
            'user_id', user_record.id,
            'email', user_record.email,
            'message', CASE 
                WHEN user_record.email_confirmed_at IS NOT NULL 
                THEN 'Email exists and is confirmed'
                ELSE 'Email exists but not confirmed'
            END
        );
    ELSE
        -- User not found
        result := json_build_object(
            'exists', false,
            'confirmed', false,
            'user_id', null,
            'email', null,
            'message', 'Email does not exist'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon;

-- Test the function (optional - you can run this to test)
-- SELECT public.check_email_exists('test@example.com');
