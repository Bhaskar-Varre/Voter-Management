import { supabase } from '@/app/utils/supabase';

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

  // console.log('API GET /voters received params:', { page, size, search, booth, gender, minAge, maxAge, caste, relegion, sentiment });

  let query = supabase.from('voters').select('id, age, booth, c_house_no, caste, fm_name_en, gender, lastname_en, mobile_no, polling_st_address, relation, relationname, relationnameen, relationsurname, relationsurnameen, relegion, surname, vid_no, fm_name_v1, lastname_v1, polling_st_address, pollingst_addresss, "comment 1", "comment 2", sentiment', { count: 'exact' });

  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    // Using the column names provided by the user for search
    query = query.or(
      `c_house_no.ilike.${searchTerm},fm_name_en.ilike.${searchTerm},fm_name_v1.ilike.${searchTerm},lastname_en.ilike.${searchTerm},lastname_v1.ilike.${searchTerm},mobile_no.ilike.${searchTerm},polling_st_address.ilike.${searchTerm},relationname.ilike.${searchTerm},relationnameen.ilike.${searchTerm},relationsurname.ilike.${searchTerm},relationsurnameen.ilike.${searchTerm},surname.ilike.${searchTerm},vid_no.ilike.${searchTerm},polling_st_address.ilike.${searchTerm},"comment 1".ilike.${searchTerm},"comment 2".ilike.${searchTerm}`
    );
  }

  if (booth && booth !== 'all') {
    query = query.eq('booth', booth);
  }

  if (gender && gender !== 'all') {
    query = query.eq('gender', gender);
  }

  if (minAge !== null) {
    query = query.gte('age', minAge);
  }

  if (maxAge !== null) {
    query = query.lte('age', maxAge);
  }
  if (caste && caste !== 'all') {
    query = query.eq('caste', caste);
  }
  if (relegion && relegion !== 'all') {
    query = query.eq('relegion', relegion);
  }
  if (sentiment && sentiment !== 'all') {
    query = query.eq('sentiment', sentiment);
  }

  const from = page * size;
  const to = from + size - 1;
  query = query.range(from, to);
  // console.log('Supabase query constructed:', query.url); // Log the constructed query URL

  const { data: voters, count, error } = await query;

  if (error) {
    console.error('Supabase GET error:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch voters', error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  console.log('Supabase GET successful:', { count, voters: voters.length });

  return new Response(JSON.stringify({
    voters,
    currentPage: page,
    totalItems: count,
    totalPages: Math.ceil(count / size),
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request) {
  const newVotersData = await request.json();
  console.log('API POST /voters received data:', newVotersData);
  const savedVoters = [];

  for (const newVoterData of newVotersData) {
    let voterToSave = { ...newVoterData };

    // Supabase handles ID generation, so remove local ID if present for new records
    if (voterToSave.id && typeof voterToSave.id === 'string' && voterToSave.id.startsWith('V')) {
      delete voterToSave.id; // Remove client-generated ID for new records
    }

    let upsertResult;
    if (voterToSave.id) { // If ID exists, it's an update
      const { data, error } = await supabase
        .from('voters')
        .update(voterToSave)
        .eq('id', voterToSave.id)
        .select();
      upsertResult = { data, error };
    } else { // Otherwise, it's a new insert
      const { data, error } = await supabase
        .from('voters')
        .insert(voterToSave)
        .select();
      upsertResult = { data, error };
    }

    if (upsertResult.error) {
      console.error('Supabase UPSERT error:', upsertResult.error);
      return new Response(JSON.stringify({ message: 'Failed to save voter', error: upsertResult.error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    savedVoters.push(upsertResult.data[0]);
  }
  console.log('API POST /voters successful, saved:', savedVoters.length, 'voters');
  return new Response(JSON.stringify(savedVoters), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
