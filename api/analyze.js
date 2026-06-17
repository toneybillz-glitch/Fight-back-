export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1500,
        messages: [
          { role: "system", content: req.body.system },
          { role: "user", content: req.body.messages[0].content }
        ],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response returned.";
    res.status(200).json({ content: [{ type: "text", text }] });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
