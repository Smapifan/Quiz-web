export default async function handler(req, res) {
  globalThis.games = globalThis.games || {};
  const now = Date.now();
  for (const id in globalThis.games) {
    if (now - globalThis.games[id].created > 3 * 60 * 1000) delete globalThis.games[id];
  }
  return res.status(200).json({ message: "Old games removed" });
}