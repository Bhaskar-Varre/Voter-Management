// import { NextResponse } from 'next/server';
// import bcrypt from 'bcrypt';
// import { supabase } from '@/app/utils/supabase'; // Assuming you have Supabase client setup here

// export async function POST(req) {
//   try {
//     const { email, password } = await req.json();

//     // Fetch user from database
//     const { data: users, error: dbError } = await supabase
//       .from('users')
//       .select('*, password_hash') // Select all columns and the password hash
//       .eq('email', email)
//       .single();

//     if (dbError && dbError.code !== 'PGRST116') { // PGRST116 means no rows found
//       console.error('Database error during authentication:', dbError);
//       return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
//     }

//     if (!users) {
//       return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
//     }

//     // Compare provided password with hashed password from database
//     const passwordMatch = await bcrypt.compare(password, users.password_hash);

//     if (passwordMatch) {
//       // Authentication successful
//       // Remove password hash before sending user data to the client
//       const userWithoutPasswordHash = { ...users };
//       delete userWithoutPasswordHash.password_hash;
//       return NextResponse.json({ success: true, user: userWithoutPasswordHash });
//     } else {
//       return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
//     }
//   } catch (error) {
//     console.error('Authentication API error:', error);
//     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import db from '@/lib/db'  // ← use your new MySQL connection

export async function POST(req) {
  const { email, password } = await req.json()

  // Query MySQL for the user
  const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  const user = rows[0]

  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

  // Compare plain password with hashed password in DB
  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

  // Remove password hash before sending to frontend
  const { password_hash, ...userWithoutPassword } = user
  return NextResponse.json({ success: true, user: userWithoutPassword })
}