import { supabase } from '@/app/utils/supabase';

export async function GET() {
  // console.log('Attempting to fetch booths...');

  if (!supabase) {
    // console.error('Supabase client is not initialized.');
    return new Response(JSON.stringify({ message: 'Supabase client not available.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // console.log('Executing Supabase select for all booth column values using pagination, then processing for distinctness...');

    const allBoothsRaw = [];
    const pageSize = 1000; // Fetch 1000 records at a time
    let currentPage = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('voters')
        .select('booth')
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

      if (error) {
        // console.error(`Supabase GET booths error on page ${currentPage}: `, error.message, error.details, error.hint, error.code);
        return new Response(JSON.stringify({ message: 'Failed to fetch booths', error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      if (data && data.length > 0) {
        allBoothsRaw.push(...data.map(item => item.booth));
        currentPage++;
      } else {
        hasMore = false;
      }
      // console.log(`Fetched page ${currentPage} of booth data. Total raw booths collected: ${allBoothsRaw.length}`);
    }

    // Apply Set to ensure uniqueness and then sort
    const uniqueBooths = [...new Set(allBoothsRaw)].filter(Boolean).sort();
    // console.log('Successfully fetched unique booths (processed from paginated raw data in JS):', uniqueBooths.length, uniqueBooths);
    return new Response(JSON.stringify(uniqueBooths), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    // console.error('Unhandled error in /api/voters/booths:', e.message, e.stack);
    return new Response(JSON.stringify({ message: 'An unexpected error occurred.', error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
