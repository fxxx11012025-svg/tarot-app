export async function POST(req) {
  const { mode, name, concern, cards, birthday, zodiac, lifePath, eto } = await req.json();

  let prompt;
  if (mode === "birthday") {
    prompt = `あなたは神秘的で温​​​​​​​​​​​​​​​​
