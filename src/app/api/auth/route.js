import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { supabase } from '@/app/utils/supabase'; // Assuming you have Supabase client setup here

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Fetch user from database
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('*, password_hash') // Select all columns and the password hash
      .eq('email', email)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Database error during authentication:', dbError);
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    if (!users) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Compare provided password with hashed password from database
    const passwordMatch = await bcrypt.compare(password, users.password_hash);

    if (passwordMatch) {
      // Authentication successful
      // Remove password hash before sending user data to the client
      const userWithoutPasswordHash = { ...users };
      delete userWithoutPasswordHash.password_hash;
      return NextResponse.json({ success: true, user: userWithoutPasswordHash });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Authentication API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
