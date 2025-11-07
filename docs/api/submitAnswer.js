export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { gameId, playerName, correct, timeLeft, totalPlayers } = req.body;
  if (!gameId || !playerName) return res.status(400).json({ error: "Missing data" });

  globalThis.games = globalThis.games || {};
  const game = globalThis.games[gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  let points = 0;
  if (correct) {
    const base = 1000;
    const timeBonus = Math.floor((timeLeft / 30) * 300);
    const playerFactor = totalPlayers > 0 ? (totalPlayers - Object.keys(game.players).length + 1) : 1;
    points = Math.floor((base + timeBonus) / playerFactor);
  }

  game.players[playerName] = (game.players[playerName] || 0) + points;
  return res.status(200).json({ points });
}