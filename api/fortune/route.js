export async function POST(req) {
  const { mode, name, concern, cards, birthday, zodiac, lifePath, eto } = await req.json();
  let prompt;
  if (mode === "birthday") {
    prompt = `あなたは神秘的で温かみのある占い師です。名前：${name || "あなた"} 生年月日：${birthday} 星座：${zodiac} 数秘術ライフパスナンバー：${lifePath} 干支：${eto}年生まれ お悩み：${concern} 上記をもとに${concern}について本格的な鑑定文を日本語450字程度で書いてください。星座・数秘術・干支を絡め、具体的アドバイスと励ましの言葉で締めてください。`;
  } else {
    const cardList = cards.map(c => `${c.name}（${c.theme}）`).join("、");
    prompt = `あなたは神秘的なタロット占い師です。名前：${name || "あなた"} 悩み：${concern} カード（過去・現在・未来）：${cardList} この3枚で${concern}について本格的なタロット鑑定文を日本語400字程度で書いてください。`;
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const text = data.content?.[0]?.text ?? "鑑定結果を取得できませんでした。";
  return Response.json({ text });
}
