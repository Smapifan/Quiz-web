import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckaerwewxtfawyvgztpn.supabase.co';
const supabaseKey = 'DEIN_ANON_KEY_HIER';
const supabase = createClient(supabaseUrl, supabaseKey);

const GAMES_TABLE = '17476';   // Neue Games Tabelle
const PLAYERS_TABLE = '17471'; // Neue Players Tabelle

export default async function handler(req,res){
  const { action, quizId, code, username, correct, currentQuestionIndex } = req.method==='POST'?req.body:req.query;

  // -------- Create Game --------
  if(action==='createGame'){
    const { data: existing } = await supabase.from(GAMES_TABLE).select().eq('code',code).single();
    if(existing) return res.status(400).json({success:false,error:"Code existiert"});
    await supabase.from(GAMES_TABLE).insert([{ code, quiz_id:quizId, host_created_at:new Date().toISOString(), started:false, current_question:0 }]);
    return res.status(200).json({success:true});
  }

  // -------- Join Game --------
  if(action==='joinGame'){
    const { data: game } = await supabase.from(GAMES_TABLE).select().eq('code',code).single();
    if(!game) return res.status(400).json({success:false,error:"Code existiert nicht"});
    await supabase.from(PLAYERS_TABLE).insert([{
      game_code:code, username, points:0, joined_at:new Date().toISOString(),
      answered_q0:false,answered_q1:false,answered_q2:false,answered_q3:false,answered_q4:false,
      answered_q5:false,answered_q6:false,answered_q7:false,answered_q8:false,answered_q9:false
    }]);
    return res.status(200).json({success:true});
  }

  // -------- Start Game --------
  if(action==='startGame'){
    await supabase.from(GAMES_TABLE).update({started:true,current_question:0}).eq('code',code);
    return res.status(200).json({success:true});
  }

  // -------- Submit Answer --------
  if(action==='submitAnswer'){
    if(!username) return res.status(400).json({success:false});

    const { data: totalPlayers } = await supabase.from(PLAYERS_TABLE).select('username').eq('game_code',code);
    const { data: answered } = await supabase.from(PLAYERS_TABLE).select('username').eq('game_code',code).not(`answered_q${currentQuestionIndex}`,'is',true);
    const alreadyAnsweredCount = totalPlayers.length - answered.length;

    let pointsToAdd = 0;
    if(correct){
      pointsToAdd = Math.floor(1000 * (totalPlayers.length - alreadyAnsweredCount)/totalPlayers.length);
    }

    const updateObj = { points: supabase.raw('points + ?', [pointsToAdd]) };
    updateObj[`answered_q${currentQuestionIndex}`] = true;

    await supabase.from(PLAYERS_TABLE).update(updateObj).eq('game_code',code).eq('username',username);
    return res.status(200).json({success:true, pointsAwarded: pointsToAdd});
  }

  // -------- Get Players --------
  if(action==='getPlayers'){
    const { data: players } = await supabase.from(PLAYERS_TABLE).select('username').eq('game_code',code);
    return res.status(200).json({success:true, players});
  }

  // -------- Get Results --------
  if(action==='getResults'){
    const { data: results } = await supabase.from(PLAYERS_TABLE).select('username, points').eq('game_code',code).order('points',{ascending:false});
    return res.status(200).json({results});
  }

  res.status(400).json({success:false,error:"Unbekannte Aktion"});
}    if(correct){
      pointsToAdd = Math.floor(1000 * (totalPlayers.length - alreadyAnsweredCount)/totalPlayers.length);
    }

    const updateObj = { points: supabase.raw('points + ?', [pointsToAdd]) };
    updateObj[`answered_q${currentQuestionIndex}`] = true;

    await supabase.from('players').update(updateObj).eq('game_code',code).eq('username',username);

    return res.status(200).json({success:true, pointsAwarded: pointsToAdd});
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
