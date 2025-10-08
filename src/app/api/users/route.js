import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { supabase } from '@/app/utils/supabase';

const saltRounds = 10;

export async function POST(req) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields (email, password, role)' }, { status: 400 });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        name: name || email,
        role,
      }])
      .select()
      .single();

    if (dbError) {
      if (dbError.code === '23505') { // Unique violation code for PostgreSQL
        return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
      }
      console.error('Database error during user creation:', dbError);
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    // Remove password hash before sending user data to the client
    const userWithoutPasswordHash = { ...newUser };
    delete userWithoutPasswordHash.password_hash;
    return NextResponse.json({ success: true, user: userWithoutPasswordHash }, { status: 201 });
  } catch (error) {
    console.error('User creation API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, role, created_at, updated_at'); // Do not select password_hash

    if (dbError) {
      console.error('Database error fetching users:', dbError);
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Get users API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
