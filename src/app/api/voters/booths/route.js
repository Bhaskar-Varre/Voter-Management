
import db from '@/lib/db';

export async function GET() {
  try {
    // 🎯 Get unique booths directly from DB
    const [rows] = await db.query(
      `SELECT DISTINCT booth FROM voters WHERE booth IS NOT NULL ORDER BY booth ASC`
    );

    // Convert to simple array
    const booths = rows.map(row => row.booth);

    return new Response(JSON.stringify(booths), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('MySQL GET booths error:', error);

    return new Response(
      JSON.stringify({
        message: 'Failed to fetch booths',
        error: error.message
      }),
      { status: 500 }
    );
  }
}