// Einzige API-Datei für alle Aktionen
let games = {}; // temporär, Supabase/GitHub API wäre hier dauerhaft

export default async function handler(req,res){
  const { action, quizId, code, username, correct } = req.method==="POST"? req.body:req.query;
  
  if(action==="createGame"){
    if(games[code]) return res.status(400).json({success:false,error:"Code existiert"});
    games[code]={quizId,players:{},created:Date.now()};
    return res.status(200).json({success:true,game:games[code]});
  }
  
  if(action==="joinGame"){
    if(!games[code]) return res.status(400).json({success:false,error:"Code existiert nicht"});
    games[code].players[username]={points:0};
    return res.status(200).json({success:true,player:{username}});
  }
  
  if(action==="submitAnswer"){
    if(!games[code] || !username) return res.status(400).json({success:false});
    if(correct) games[code].players[username].points += 1000; // einfache Punkte
    return res.status(200).json({success:true,points:games[code].players[username].points});
  }
  
  if(action==="getResults"){
    if(!games[code]) return res.status(400).json({success:false});
    const results = Object.entries(games[code].players).map(([name,data])=>({name,points:data.points})).sort((a,b)=>b.points-a.points);
    return res.status(200).json({results});
  }

  res.status(400).json({success:false,error:"Unbekannte Aktion"});
}
