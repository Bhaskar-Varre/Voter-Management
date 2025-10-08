require('dotenv').config({ path: './.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const votersData = [{'idx':0,'id':2,'ac_no':'40','age':64,'booth':'199','c_house_no':'1-4','caste':null,'colour':null,'fm_name_en':'B Kishtaiah','fm_namev1':null,'gender':'Male','houseno_en':null,'lastname_en':'Byathulu','lastnamev1':null,'mobile_no':'9440221912','polling_st_address':'GHMC Office, Patancheru','polling_st_address_en':null,'relation':'Father','relationname':'పోచయ్య','relationnameen':'Pocaiah','relationsurname':'బ్యాతులు','relationsurnameen':null,'relegion':null,'section_name':null,'section_name_en':null,'section_no':'1','surname':'Byathulu','vid_no':'FBD4309662','votersl':'1','fm_name_v1':'బి. కిష్టయ్య','lastname_v1':'బ్యాతులు','section_nameen':'Chaithanya Nagara Colony','polling_st_addressen':null},{'idx':1,'id':3,'ac_no':'40','age':60,'booth':'199','c_house_no':'1-4','caste':null,'colour':null,'fm_name_en':'B Lakshminarsamma','fm_namev1':null,'gender':'Female','houseno_en':null,'lastname_en':'Byathulu','lastnamev1':null,'mobile_no':null,'polling_st_address':'GHMC Office, Patancheru','polling_st_address_en':null,'relation':'Husband','relationname':'కిష్టయ్య','relationnameen':'Kishtaiah','relationsurname':'బ్యాతుల','relationsurnameen':null,'relegion':null,'section_name':null,'section_name_en':null,'section_no':'1','surname':'Byathulu','vid_no':'XIZ4571451','votersl':'2','fm_name_v1':'బి. లక్ష్మినర్సమ్మ','lastname_v1':'బ్యాతుల','section_nameen':'Chaithanya Nagara Colony','polling_st_addressen':null}];

async function importVoters() {
  for (const voter of votersData) {
    // Remove 'id' and 'idx' to let Supabase handle primary key and auto-increment
    const { id, idx, ...voterToInsert } = voter;

    // Map `ac_no` to `acNo` etc. for camelCase in Supabase table
    const mappedVoter = {
      ...voterToInsert,
      acNo: voter.ac_no, // Ensure consistent casing
      cHouseNo: voter.c_house_no,
      fmNameEn: voter.fm_name_en,
      fmNameV1: voter.fm_name_v1,
      housenoEn: voter.houseno_en,
      lastnameEn: voter.lastname_en,
      lastnameV1: voter.lastname_v1,
      mobileNo: voter.mobile_no,
      pollingStAddress: voter.polling_st_address,
      pollingStAddressEn: voter.polling_st_address_en,
      sectionNo: voter.section_no,
      sectionName: voter.section_name,
      sectionNameEn: voter.section_name_en,
      vidNo: voter.vid_no,
      mobileNo: voter.mobile_no // Ensure consistent casing
    };

    const { data, error } = await supabase
      .from('voters')
      .upsert(mappedVoter, { onConflict: 'voterId' }); // Use voterId as conflict key for upsert

    if (error) {
      console.error('Error importing voter:', voter.voterId, error.message);
    } else {
      console.log('Successfully imported voter:', data);
    }
  }
  console.log('Voter import process finished.');
  process.exit(0);
}

importVoters();
