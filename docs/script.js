const API_BASE = "https://DEIN-VERCEL-NAME.vercel.app/api";
let currentQuiz = null, currentQuestion = 0, score = 0, gameId = null, playerName = null;
let timer, timeLeft = 30;

async function loadQuizzes() {
  const quizzes = await fetch("data/quizzes.json").then(r => r.json());
  const container = document.getElementById("quiz-select");
  container.innerHTML = "<h2>Wähle ein Quiz:</h2>";

  quizzes.forEach(q => {
    const card = document.createElement("div");
    card.style.background = q.color;
    card.style.padding = "10px";
    card.style.margin = "10px";
    card.style.borderRadius = "8px";
    card.innerHTML = `<h3>${q.title}</h3><p>${q.description}</p>`;
    const btn = document.createElement("button");
    btn.textContent = "Starten";
    btn.onclick = () => startQuiz(q);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

async function startQuiz(quiz) {
  playerName = prompt("Dein Spielername:");
  const res = await fetch(`${API_BASE}/createGame`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quizId: quiz.id })
  });
  const data = await res.json();
  gameId = data.gameId;
  currentQuiz = quiz;
  document.getElementById("quiz-select").style.display = "none";
  showQuestion();
}

async function showQuestion() {
  const questions = await fetch("data/questions.json").then(r => r.json());
  const list = questions[currentQuiz.questions_key];
  if (currentQuestion >= list.length) return showResults();

  const q = list[currentQuestion];
  const div = document.getElementById("game");
  div.innerHTML = `<h2>${q.question}</h2><div id='timer'>30</div>`;

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => answer(opt === q.correct);
    div.appendChild(btn);
  });

  timeLeft = 30;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      answer(false);
    }
  }, 1000);
}

async function answer(correct) {
  clearInterval(timer);
  const res = await fetch(`${API_BASE}/submitAnswer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, playerName, correct, timeLeft, totalPlayers: 10 })
  });
  const data = await res.json();
  score += data.points;
  currentQuestion++;
  alert(`Du hast jetzt ${score} Punkte`);
  setTimeout(showQuestion, 1000);
}

async function showResults() {
  const res = await fetch(`${API_BASE}/getResults?gameId=${gameId}`);
  const data = await res.json();
  const div = document.getElementById("result");
  div.innerHTML = "<h2>Endergebnis</h2>";

  data.results.forEach((r, i) => {
    const p = document.createElement("div");
    p.textContent = `${i + 1}. ${r.name} — ${r.score} Punkte`;
    if (i === 0) p.style.color = "#FFD700";
    if (i === 1) p.style.color = "#C0C0C0";
    if (i === 2) p.style.color = "#CD7F32";
    div.appendChild(p);
  });
}

loadQuizzes();