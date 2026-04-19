
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import db from '@/lib/db'  

export async function POST(req) {
  const { email, password } = await req.json()

  // Query MySQL for the user
  const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  const user = rows[0]

  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

 
  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }


  const { password_hash, ...userWithoutPassword } = user
  return NextResponse.json({ success: true, user: userWithoutPassword })
}