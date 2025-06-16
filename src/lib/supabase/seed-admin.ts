import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcrypt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdminUser() {
  const adminEmail = 'admin@restarttheserver.com';
  const adminPassword = 'admin123'; // Change this to a secure password

  try {
    // Hash the password
    const passwordHash = await hash(adminPassword, 10);

    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const { error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: adminEmail,
          password_hash: passwordHash,
        },
      ]);

    if (error) throw error;

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

seedAdminUser(); 