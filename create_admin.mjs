import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cluljcdkdzliuiixakvh.supabase.co';
const supabaseKey = 'sb_publishable_nTWG2hLK07jul5QoqiFw6g_NVgSOwO9';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin2002@yopmail.com',
    password: 'AdminPassword123!',
    options: {
      data: {
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error creating admin:', error.message);
  } else {
    console.log('Admin user created successfully!');
    console.log('Email: admin2002@yopmail.com');
    console.log('Password: AdminPassword123!');
  }
}

createAdmin();
