const https = require("https");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "API key not configured" });

  const payload = JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: req.body.system || "You are a helpful legal assistant.",
    messages: req.body.messages || [],
  });

  return new Promise((resolve) => {
    const request = https.request({
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    }, (response) => {
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => {
        try { res.status(response.statusCode).json(JSON.parse(data)); }
        catch(e) { res.status(500).json({ error: "Parse error" }); }
        resolve();
      });
    });
    request.on("error", (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
    request.write(payload);
    request.end();
  });
};
