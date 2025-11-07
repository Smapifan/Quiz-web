import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckaerwewxtfawyvgztpn.supabase.co';
const supabaseKey = 'DEIN_ANON_KEY_HIER'; // Ersetze mit deinem Key
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req,res){
  const { action, quizId, code, username, correct } = req.method==='POST'?req.body:req.query;

  if(action==='createGame'){
    const { data: existing } = await supabase.from('games').select().eq('code',code).single();
    if(existing) return res.status(400).json({success:false,error:"Code existiert"});
    await supabase.from('games').insert([{ code, quiz_id:quizId, host_created_at:new Date().toISOString(), started:false }]);
    return res.status(200).json({success:true});
  }

  if(action==='joinGame'){
    const { data: game } = await supabase.from('games').select().eq('code',code).single();
    if(!game) return res.status(400).json({success:false,error:"Code existiert nicht"});
    await supabase.from('players').insert([{ game_code:code, username, points:0, joined_at:new Date().toISOString() }]);
    return res.status(200).json({success:true});
  }

  if(action==='startGame'){
    await supabase.from('games').update({started:true}).eq('code',code);
    return res.status(200).json({success:true});
  }

  if(action==='submitAnswer'){
    if(!username) return res.status(400).json({success:false});
    if(correct){
      const { data: player } = await supabase.from('players').select().eq('game_code',code).eq('username',username).single();
      await supabase.from('players').update({ points:player.points+1000 }).eq('game_code',code).eq('username',username);
    }
    return res.status(200).json({success:true});
  }

  if(action==='getPlayers'){
    const { data: players } = await supabase.from('players').select('username').eq('game_code',code);
    return res.status(200).json({success:true, players});
  }

  if(action==='getResults'){
    const { data: results } = await supabase.from('players').select('username, points').eq('game_code',code).order('points',{ascending:false});
    return res.status(200).json({results});
  }

  res.status(400).json({success:false,error:"Unbekannte Aktion"});
}    const results = Object.entries(games[code].players)
      .map(([name,data])=>({name,points:data.points}))
      .sort((a,b)=>b.points-a.points);
    return res.status(200).json({results});
  }

  // ------------------ Get Players ------------------
  if(action==="getPlayers"){
    if(!games[code]) return res.status(400).json({success:false});
    const players = Object.entries(games[code].players).map(([username,data])=>({username}));
    return res.status(200).json({success:true, players});
  }

  res.status(400).json({success:false,error:"Unbekannte Aktion"});
}
