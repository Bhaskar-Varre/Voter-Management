

import db from '@/lib/db'
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '0');
  const size = parseInt(searchParams.get('size') || '100');
  const search = searchParams.get('search');
  const booth = searchParams.get('booth');
  const gender = searchParams.get('gender');
  const minAge = searchParams.get('minAge') ? parseInt(searchParams.get('minAge')) : null;
  const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')) : null;
  const caste = searchParams.get('caste');
  const relegion = searchParams.get('relegion');
  const sentiment = searchParams.get('sentiment');

  let where = [];
  let values = [];

  // 🔍 SEARCH
  if (search) {
    const searchTerm = `%${search}%`;
    where.push(`(
      c_house_no LIKE ? OR
      fm_name_en LIKE ? OR
      fm_name_v1 LIKE ? OR
      lastname_en LIKE ? OR
      lastname_v1 LIKE ? OR
      mobile_no LIKE ? OR
      polling_st_address LIKE ? OR
      relationname LIKE ? OR
      relationnameen LIKE ? OR
      relationsurname LIKE ? OR
      relationsurnameen LIKE ? OR
      surname LIKE ? OR
      vid_no LIKE ? OR
      comment_1 LIKE ? OR
      comment_2 LIKE ?
    )`);

    values.push(
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
    );
  }

  // 🎯 FILTERS
  if (booth && booth !== 'all') {
    where.push(`booth = ?`);
    values.push(booth);
  }

  if (gender && gender !== 'all') {
    where.push(`gender = ?`);
    values.push(gender);
  }

  if (minAge !== null) {
    where.push(`age >= ?`);
    values.push(minAge);
  }

  if (maxAge !== null) {
    where.push(`age <= ?`);
    values.push(maxAge);
  }

  if (caste && caste !== 'all') {
    where.push(`caste = ?`);
    values.push(caste);
  }

  if (relegion && relegion !== 'all') {
    where.push(`relegion = ?`);
    values.push(relegion);
  }

  if (sentiment && sentiment !== 'all') {
    where.push(`sentiment = ?`);
    values.push(sentiment);
  }

  // 🧱 WHERE CLAUSE
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const offset = page * size;

  try {
    // 📊 GET DATA
    const [rows] = await db.query(
      `SELECT * FROM voters ${whereClause} LIMIT ? OFFSET ?`,
      [...values, size, offset]
    );

    // 📊 COUNT
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM voters ${whereClause}`,
      values
    );

    const total = countResult[0].total;

    return Response.json({
      voters: rows,
      currentPage: page,
      totalItems: total,
      totalPages: Math.ceil(total / size),
    });

  } catch (error) {
    console.error('MySQL GET error:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch voters', error: error.message }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const newVotersData = await request.json();
  const savedVoters = [];

  try {
    for (const voter of newVotersData) {

      if (voter.id) {
        // 🔄 UPDATE
        await db.query(
          `UPDATE voters SET ? WHERE id = ?`,
          [voter, voter.id]
        );

        const [updated] = await db.query(
          `SELECT * FROM voters WHERE id = ?`,
          [voter.id]
        );

        savedVoters.push(updated[0]);

      } else {
        // ➕ INSERT
        await db.query(
          `INSERT INTO voters (id, age, booth, c_house_no, caste, fm_name_en, gender, lastname_en, mobile_no, polling_st_address, relation, relationname, relationnameen, relationsurname, relationsurnameen, relegion, surname, vid_no, fm_name_v1, lastname_v1, pollingst_addresss, comment_1, comment_2, sentiment)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            voter.age, voter.booth, voter.c_house_no, voter.caste,
            voter.fm_name_en, voter.gender, voter.lastname_en,
            voter.mobile_no, voter.polling_st_address, voter.relation,
            voter.relationname, voter.relationnameen,
            voter.relationsurname, voter.relationsurnameen,
            voter.relegion, voter.surname, voter.vid_no,
            voter.fm_name_v1, voter.lastname_v1,
            voter.pollingst_addresss, voter.comment_1,
            voter.comment_2, voter.sentiment
          ]
        );

        const [inserted] = await db.query(
          `SELECT * FROM voters ORDER BY created_at DESC LIMIT 1`
        );

        savedVoters.push(inserted[0]);
      }
    }

    return Response.json(savedVoters);

  } catch (error) {
    console.error('MySQL POST error:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to save voter', error: error.message }),
      { status: 500 }
    );
  }
}