const API_BASE = "/api/api.js"; // Vercel Route
let currentQuiz = null, questions = [], currentQuestionIndex = 0, timerInterval;
let gameCode = null, username = null;

document.getElementById("createGameBtn").onclick = async () => {
  const quizId = prompt("Welches Quiz starten? z.B. math_basic");
  const customCode = prompt("Benutzerdefinierter Spielcode:");
  if (!quizId || !customCode) return alert("Bitte Quiz und Code eingeben");
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action:"createGame", quizId, code: customCode })
  });
  const data = await res.json();
  if (!data.success) return alert("Code bereits vorhanden!");
  gameCode = customCode;
  loadQuizzes();
};

document.getElementById("joinGameBtn").onclick = () => {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("joinMenu").style.display = "block";
};

document.getElementById("joinConfirm").onclick = async () => {
  gameCode = document.getElementById("joinCode").value.trim();
  username = document.getElementById("username").value.trim();
  if (!gameCode || !username) return alert("Bitte Code + Name");
  const res = await fetch(API_BASE, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ action:"joinGame", code:gameCode, username })
  });
  const data = await res.json();
  if (!data.success) return alert("Ungültiger Code");
  startQuiz();
};

function goBack() {
  document.querySelectorAll(".container").forEach(c => c.style.display="none");
  document.getElementById("mainMenu").style.display="block";
}

async function loadQuizzes() {
  const res = await fetch("data/quizzes.json");
  const quizzes = await res.json();
  const quizList = document.getElementById("quizList");
  quizList.innerHTML = "";
  quizzes.forEach(q=>{
    const btn = document.createElement("button");
    btn.textContent = q.title;
    btn.style.background = q.color;
    btn.onclick = ()=>startGame(q.id);
    quizList.appendChild(btn);
  });
  document.getElementById("quizSelect").style.display="block";
}

async function startGame(quizId) {
  const res = await fetch("data/questions.json");
  const allQuestions = await res.json();
  const quiz = (await (await fetch("data/quizzes.json")).json()).find(q=>q.id===quizId);
  questions = allQuestions[quiz.questions_key];
  currentQuiz = quiz;
  currentQuestionIndex=0;
  document.getElementById("quizSelect").style.display="none";
  document.getElementById("gameArea").style.display="block";
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  if(!q) return showResults();
  document.getElementById("questionText").textContent = q.question;
  const options = document.getElementById("options");
  options.innerHTML = "";
  q.options.forEach(opt=>{
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = ()=>answer(opt===q.correct);
    options.appendChild(btn);
  });
  startTimer();
}

function startTimer() {
  let time = currentQuiz.time_per_question;
  document.getElementById("timer").textContent=`⏳ ${time}s`;
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    time--;
    document.getElementById("timer").textContent=`⏳ ${time}s`;
    if(time<=0){ clearInterval(timerInterval); answer(false); }
  },1000);
}

async function answer(correct){
  clearInterval(timerInterval);
  await fetch(API_BASE,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({action:"submitAnswer", code:gameCode, username, correct})
  });
  currentQuestionIndex++;
  setTimeout(showQuestion,1000);
}

async function showResults(){
  document.getElementById("gameArea").style.display="none";
  document.getElementById("resultsArea").style.display="block";
  const res = await fetch(`${API_BASE}?action=getResults&code=${gameCode}`);
  const data = await res.json();
  const podium = document.getElementById("podium");
  podium.innerHTML="";
  data.results.slice(0,5).forEach((p,i)=>{
    const el=document.createElement("div");
    el.textContent=`${i+1}. ${p.name} - ${p.points} Punkte`;
    podium.appendChild(el);
  });
}
