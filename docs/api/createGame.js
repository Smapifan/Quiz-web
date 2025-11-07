export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { quizId } = req.body;
  const gameId = Math.floor(10000 + Math.random() * 90000).toString();

  globalThis.games = globalThis.games || {};
  globalThis.games[gameId] = {
    quizId,
    players: {},
    created: Date.now()
  };

  return res.status(200).json({ gameId });
}
