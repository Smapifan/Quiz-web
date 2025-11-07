export default async function handler(req, res) {
  const { gameId } = req.query;
  if (!gameId) return res.status(400).json({ error: "Missing gameId" });

  globalThis.games = globalThis.games || {};
  const game = globalThis.games[gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  const results = Object.entries(game.players)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  return res.status(200).json({ results });
}