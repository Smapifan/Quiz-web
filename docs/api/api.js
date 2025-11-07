let games = {}; // temporär, sonst Supabase/GitHub API verwenden

export default async function handler(req,res){
  const { action, quizId, code, username, correct } = req.method==="POST"? req.body:req.query;

  // ------------------ Create Game ------------------
  if(action==="createGame"){
    if(games[code]) return res.status(400).json({success:false,error:"Code existiert"});
    games[code] = { quizId, players:{}, created: Date.now(), started: false };
    return res.status(200).json({success:true, game:games[code]});
  }

  // ------------------ Join Game ------------------
  if(action==="joinGame"){
    if(!games[code]) return res.status(400).json({success:false,error:"Code existiert nicht"});
    games[code].players[username]={points:0};
    return res.status(200).json({success:true,player:{username}});
  }

  // ------------------ Start Game ------------------
  if(action==="startGame"){
    if(!games[code]) return res.status(400).json({success:false});
    games[code].started = true;
    return res.status(200).json({success:true});
  }

  // ------------------ Submit Answer ------------------
  if(action==="submitAnswer"){
    if(!games[code] || !username) return res.status(400).json({success:false});
    if(correct) games[code].players[username].points += 1000; // simple scoring
    return res.status(200).json({success:true, points:games[code].players[username].points});
  }

  // ------------------ Get Results ------------------
  if(action==="getResults"){
    if(!games[code]) return res.status(400).json({success:false});
    const results = Object.entries(games[code].players)
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
