-- Create initial admin user
DO $$
DECLARE
    admin_email TEXT := 'admin@restarttheserver.com';
    admin_password TEXT := 'admin123'; -- Change this to a secure password
    admin_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_id
    FROM auth.users
    WHERE email = admin_email;

    -- If admin doesn't exist, create them
    IF admin_id IS NULL THEN
        -- Create auth user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO admin_id;
    END IF;

    -- Create or update admin profile
    INSERT INTO user_profiles (id, role)
    VALUES (admin_id, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
END $$; 