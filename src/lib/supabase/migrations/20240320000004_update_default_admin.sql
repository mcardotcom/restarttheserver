-- Update the admin user in auth.users
UPDATE auth.users
SET email = 'contact@stolenhomework.com',
    encrypted_password = crypt('Plumgoat8@', gen_salt('bf'))
WHERE email = 'admin@restarttheserver.com';

-- Update the admin user in admin_users
UPDATE admin_users
SET email = 'contact@stolenhomework.com'
WHERE email = 'admin@restarttheserver.com';

-- Update the admin user in user_profiles if it exists
UPDATE user_profiles
SET id = (SELECT id FROM auth.users WHERE email = 'contact@stolenhomework.com')
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@restarttheserver.com'
); 