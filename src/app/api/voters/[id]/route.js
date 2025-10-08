import { supabase } from '@/app/utils/supabase';

export async function PUT(request, { params }) {
  const { id } = params;
  const updatedVoterData = await request.json();

  const { data, error } = await supabase
    .from('voters')
    .update(updatedVoterData)
    .eq('id', parseInt(id))
    .select();

  if (error) {
    // console.error('Supabase PUT error:', error);
    return new Response(JSON.stringify({ message: 'Failed to update voter', error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  if (!data || data.length === 0) {
    return new Response(JSON.stringify({ message: 'Voter not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(data[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(request, { params }) {
  const { id } = params;

  const { error } = await supabase
    .from('voters')
    .delete()
    .eq('id', parseInt(id));

  if (error) {
    // console.error('Supabase DELETE error:', error);
    return new Response(JSON.stringify({ message: 'Failed to delete voter', error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Supabase delete operation doesn't return the deleted item, 
  // so we assume success if no error.
  return new Response(null, { status: 204 });
}
