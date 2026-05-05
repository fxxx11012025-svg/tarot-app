"use client";
import { useState } from "react";

const TAROT_CARDS = [
  { name: "愚者", emoji: "🌟", theme: "新しい始まり" },
  { name: "魔術師", emoji: "✨", theme: "可能性と才能" },
  { name: "女教皇", emoji: "🌙", theme: "直感と神秘" },
  { name: "女帝", emoji: "🌸", theme: "豊かさと愛" },
  { name: "皇帝", emoji: "👑", theme: "安定と権威" },
  { name: "恋人", emoji: "💕", theme: "選択と愛情" },
  { name: "戦車", emoji: "⚡", theme: "意志と勝利" },
  { name: "力", emoji: "🦁", theme: "勇気と強さ" },
  { name: "隠者", emoji: "🕯️", theme: "内省と知恵" },
  { name: "運命の輪", emoji: "🎡", theme: "転換点と運命" },
  { name: "正義", emoji: "⚖️", theme: "バランスと真実" },
  { name: "吊られた男", emoji: "🔮", theme: "待機と啓示" },
  { name: "死神", emoji: "🌑", theme: "変容と再生" },
  { name: "節制", emoji: "🌊", theme: "調和と流れ" },
  { name: "悪魔", emoji: "🔗", theme: "解放と誘惑" },
  { name: "塔", emoji: "💥", theme: "突破と変化" },
  { name: "星", emoji: "⭐", theme: "希望と癒し" },
  { name: "月", emoji: "🌕", theme: "幻想と本能" },
  { name: "太陽", emoji: "☀️", theme: "喜びと成功" },
  { name: "審判", emoji: "🎺", theme: "覚醒と復活" },
  { name: "世界", emoji: "🌍", theme: "完成と達成" },
];

const CONCERNS = ["恋愛・出会い", "仕事・キャリア", "お金・金運", "人間関係", "今日の運勢"];

function getZodiac(month, day) {
  const signs = [
    { name: "山羊座", emoji: "♑", end: [1,19] },
    { name: "水瓶座", emoji: "♒", end: [2,18] },
    { name: "魚座", emoji: "♓", end: [3,20] },
    { name: "牡羊座", emoji: "♈", end: [4,19] },
    { name: "牡牛座", emoji: "♉", end: [5,20] },
    { name: "双子座", emoji: "♊", end: [6,21] },
    { name: "蟹座", emoji: "♋", end: [7,22] },
    { name: "獅子座", emoji: "♌", end: [8,22] },
    { name: "乙女座", emoji: "♍", end: [9,22] },
    { name: "天秤座", emoji: "♎", end: [10,23] },
    { name: "蠍座", emoji: "♏", end: [11,22] },
    { name: "射手座", emoji: "♐", end: [12,21] },
    { name: "山羊座", emoji: "♑", end: [12,31] },
  ];
  return signs.find(s => month < s.end[0] || (month === s.end[0] && day <= s.end[1]));
}

function getLifePath(year, month, day) {
  const digits = `${year}${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}`.split("").map(Number);
  let sum = digits.reduce((a,b) => a+b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split("").map(Number).reduce((a,b) => a+b, 0);
  }
  return sum;
}

function getEto(year) {
  return ["申","酉","戌","亥","子","丑","寅","卯","辰","巳","午","未"][year % 12];
}

function StarBg() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i, left: `${(i*37.3)%100}%`, top: `${(i*53.7)%100}%`,
    size: (i%3)+1, opacity: ((i%7)+1)/10, duration: (i%3)+2, delay: i%3,
  }));
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:s.left, top:s.top,
          width:s.size, height:s.size, borderRadius:"50%",
          background:"white", opacity:s.opacity,
          animation:`twinkle ${s.duration}s ease-in-out infinite`,
          animationDelay:`${s.delay}s`,
        }}/>
      ))}
    </div>
  );
}

export default function TarotApp() {
  const [step, setStep] = useState("home");
  const [mode, setMode] = useState("tarot");
  const [concern, setConcern] = useState("");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedCards, setSelectedCards] = useState([]);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealedCards, setRevealedCards] = useState([]);
  const [shuffling, setShuffling] = useState(false);
  const [birthInfo, setBirthInfo] = useState(null);

  const pickCards = () => [...TAROT_CARDS].sort(() => Math.random()-0.5).slice(0,3);

  const handleShuffle = () => {
    setShuffling(true);
    setTimeout(() => {
      setSelectedCards(pickCards());
      setShuffling(false);
      setStep("reveal");
      setRevealedCards([]);
    }, 1500);
  };

  const revealCard = (index) => {
    if (revealedCards.includes(index)) return;
    const next = [...revealedCards, index];
    setRevealedCards(next);
    if (next.length === 3) setTimeout(() => fetchTarotReading(), 500);
  };

  const fetchTarotReading = async () => {
    setLoading(true);
    setStep("reading");
    try {
      const res = await fetch("/api/fortune", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mode:"tarot", name, concern, cards: selectedCards }),
      });
      const data = await res.json();
      setReading(data.text);
    } catch { setReading("星の声が届きませんでした。もう一度お試しください。"); }
    setLoading(false);
  };

  const handleBirthdayFortune = () => {
    if (!birthday || !concern) return;
    const [y,m,d] = birthday.split("-").map(Number);
    const zodiac = getZodiac(m, d);
    const lifePath = getLifePath(y, m, d);
    const eto = getEto(y);
    const info = { zodiac, lifePath, eto };
    setBirthInfo(info);
    fetchBirthdayReading(info);
  };

  const fetchBirthdayReading = async ({ zodiac, lifePath, eto }) => {
    setLoading(true);
    setStep("reading");
    try {
      const res = await fetch("/api/fortune", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mode:"birthday", name, concern, birthday, zodiac:zodiac.name, lifePath, eto }),
      });
      const data = await res.json();
      setReading(data.text);
    } catch { setReading("星の声が届きませんでした。もう一度お試しください。"); }
    setLoading(false);
  };

  const reset = () => {
    setStep("home"); setMode("tarot"); setConcern(""); setName(""); setBirthday("");
    setSelectedCards([]); setReading(""); setRevealedCards([]); setBirthInfo(null);
  };

  const canStart = concern && (mode==="tarot" || (mode==="birthday" && birthday));

  const cs = {
    wrap: { minHeight:"100vh", background:"radial-gradient(ellipse at top,#1a0533 0%,#0d0220 40%,#050010 100%)", fontFamily:"'Georgia',serif", color:"#e8d5ff", position:"relative" },
    inner: { position:"relative", zIndex:10, maxWidth:480, margin:"0 auto", padding:"20px 16px", minHeight:"100vh" },
    card: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(180,120,255,0.2)", backdropFilter:"blur(10px)", borderRadius:20, padding:"24px" },
    btn: { background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"1px solid rgba(180,120,255,0.4)", color:"white", padding:"14px 32px", borderRadius:50, fontSize:"1rem", cursor:"pointer", width:"100%", letterSpacing:"0.05em" },
    input: { width:"100%", padding:"12px 16px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(180,120,255,0.3)", color:"#e8d5ff", fontSize:"1rem", outline:"none", boxSizing:"border-box" },
    label: { display:"block", fontSize:"0.8rem", color:"rgba(220,180,255,0.6)", marginBottom:8, letterSpacing:"0.1em" },
  };

  return (
    <div style={cs.wrap}>
      <style>{`
        @keyframes twinkle{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(180,120,255,.3)}50%{box-shadow:0 0 40px rgba(180,120,255,.8)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.8) sepia(1) saturate(2) hue-rotate(220deg);cursor:pointer;}
      `}</style>
      <StarBg />
      <div style={cs.inner}>
        <div style={{ textAlign:"center", paddingTop:20, paddingBottom:10 }}>
          <div style={{ fontSize:"2.5rem", animation:"float 4s ease-in-out infinite" }}>🔮</div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:"bold", margin:"8px 0 4px", letterSpacing:"0.1em", background:"linear-gradient(135deg,#ffd700,#ffaa00,#ffe066,#ffaa00,#ffd700)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 3s linear infinite" }}>
            星詠みタロット
          </h1>
          <p style={{ color:"rgba(220,180,255,0.6)", fontSize:"0.8rem", letterSpacing:"0.15em" }}>AI TAROT ORACLE</p>
        </div>

        {step === "home" && (
          <div style={{ animation:"fadeUp 0.6s ease" }}>
            <div style={{ ...cs.card, marginTop:20 }}>
              <p style={{ textAlign:"center", color:"rgba(220,180,255,0.8)", marginBottom:20, lineHeight:1.8, fontSize:"0.95rem" }}>
                星の導きに従い、カードがあなたの運命を照らし出します
              </p>
              <div style={{ marginBottom:16 }}>
                <label style={cs.label}>✦ お名前（ニックネーム可）</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="名前を入力..." style={cs.input}/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={cs.label}>✦ 占い方法を選んでください</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["tarot","🃏 タロット占い"],["birthday","🎂 生年月日占い"]].map(([m,label]) => (
                    <button key={m} onClick={()=>setMode(m)} style={{
                      flex:1, padding:"12px 8px", borderRadius:12, fontSize:"0.85rem", cursor:"pointer",
                      background: mode===m ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.04)",
                      border:`1px solid ${mode===m ? "rgba(180,120,255,0.8)" : "rgba(180,120,255,0.2)"}`,
                      color: mode===m ? "#e8d5ff" : "rgba(220,180,255,0.7)",
                      boxShadow: mode===m ? "0 0 15px rgba(168,85,247,0.4)" : "none",
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              {mode === "birthday" && (
                <div style={{ marginBottom:16 }}>
                  <label style={cs.label}>✦ 生年月日</label>
                  <input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} max={new Date().toISOString().split("T")[0]} style={{ ...cs.input, colorScheme:"dark" }}/>
                  {birthday && (() => {
                    const [y,m,d] = birthday.split("-").map(Number);
                    const z = getZodiac(m,d);
                    const lp = getLifePath(y,m,d);
                    const eto = getEto(y);
                    return (
                      <div style={{ display:"flex", gap:6, marginTop:10 }}>
                        {[{label:"星座",val:`${z.emoji} ${z.name}`},{label:"数秘",val:`No.${lp}`},{label:"干支",val:`${eto}年`}].map(item => (
                          <div key={item.label} style={{ flex:1, background:"rgba(180,120,255,0.1)", border:"1px solid rgba(180,120,255,0.3)", borderRadius:10, padding:"8px 4px", textAlign:"center" }}>
                            <div style={{ fontSize:"0.65rem", color:"rgba(180,120,255,0.7)" }}>{item.label}</div>
                            <div style={{ fontSize:"0.85rem", color:"#ffd700", fontWeight:"bold", marginTop:2 }}>{item.val}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div style={{ marginBottom:24 }}>
                <label style={cs.label}>✦ 今日のお悩みは？</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {CONCERNS.map(c => (
                    <button key={c} onClick={()=>setConcern(c)} style={{
                      padding:"10px 8px", borderRadius:12, fontSize:"0.85rem", cursor:"pointer",
                      background: concern===c ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.04)",
                      border:`1px solid ${concern===c ? "rgba(180,120,255,0.8)" : "rgba(180,120,255,0.2)"}`,
                      color: concern===c ? "#e8d5ff" : "rgba(220,180,255,0.7)",
                      boxShadow: concern===c ? "0 0 15px rgba(168,85,247,0.4)" : "none",
                      gridColumn: c==="今日の運勢" ? "span 2" : "span 1",
                    }}>{c}</button>
                  ))}
                </div>
              </div>
              <button style={{ ...cs.btn, opacity:canStart?1:0.4, cursor:canStart?"pointer":"not-allowed" }}
                onClick={() => { if (!canStart) return; mode==="tarot" ? setStep("shuffle") : handleBirthdayFortune(); }}>
                {mode==="tarot" ? "カードを引く ✦" : "生年月日で占う ✦"}
              </button>
            </div>
          </div>
        )}

        {step === "shuffle" && (
          <div style={{ textAlign:"center", marginTop:40, animation:"fadeUp 0.6s ease" }}>
            <p style={{ color:"rgba(220,180,255,0.8)", marginBottom:30, lineHeight:1.8 }}>
              {name ? `${name}さん、` : ""}心を落ち着けて、<br/>「{concern}」について深く想いを込めながら<br/>カードをシャッフルしてください
            </p>
            <div onClick={!shuffling ? handleShuffle : undefined} style={{
              width:140, height:200, margin:"0 auto 30px",
              background:"linear-gradient(135deg,#2d1b6e,#4c1d95)", borderRadius:16,
              cursor:shuffling?"default":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12,
              animation:shuffling?"spin 0.5s linear infinite":"glow 2s ease-in-out infinite",
              border:"2px solid rgba(180,120,255,0.5)",
            }}>
              <span style={{ fontSize:"3rem" }}>🃏</span>
              <span style={{ fontSize:"0.8rem", color:"rgba(220,180,255,0.8)" }}>
                {shuffling ? "シャッフル中..." : "タップしてシャッフル"}
              </span>
            </div>
          </div>
        )}

        {step === "reveal" && (
          <div style={{ marginTop:20, animation:"fadeUp 0.6s ease" }}>
            <p style={{ textAlign:"center", color:"rgba(220,180,255,0.7)", marginBottom:20, fontSize:"0.9rem" }}>
              カードをタップして、運命を開いてください
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              {selectedCards.map((card,i) => {
                const isRevealed = revealedCards.includes(i);
                return (
                  <div key={i} onClick={()=>revealCard(i)} style={{ width:130, cursor:isRevealed?"default":"pointer" }}>
                    <div style={{ fontSize:"0.75rem", textAlign:"center", marginBottom:8, color:"rgba(220,180,255,0.6)" }}>
                      {["過去","現在","未来"][i]}
                    </div>
                    <div style={{
                      height:180, borderRadius:16,
                      background:isRevealed?"linear-gradient(135deg,#1e0a3e,#3b0764)":"linear-gradient(135deg,#3b0764,#1e0a3e)",
                      border:`2px solid ${isRevealed?"rgba(255,215,0,0.6)":"rgba(180,120,255,0.4)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10,
                      animation:isRevealed?"none":"glow 2s ease-in-out infinite",
                    }}>
                      {isRevealed ? (
                        <>
                          <div style={{ fontSize:"2.5rem" }}>{card.emoji}</div>
                          <div style={{ fontSize:"0.95rem", fontWeight:"bold", color:"#ffd700" }}>{card.name}</div>
                          <div style={{ fontSize:"0.7rem", color:"rgba(220,180,255,0.7)", textAlign:"center" }}>{card.theme}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize:"2rem" }}>✦</div>
                          <div style={{ fontSize:"0.75rem", color:"rgba(180,120,255,0.6)" }}>タップで開く</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {revealedCards.length < 3 && (
              <p style={{ textAlign:"center", marginTop:20, color:"rgba(220,180,255,0.5)", fontSize:"0.85rem" }}>
                残り {3-revealedCards.length} 枚
              </p>
            )}
          </div>
        )}

        {step === "reading" && (
          <div style={{ marginTop:20, animation:"fadeUp 0.6s ease" }}>
            {mode==="tarot" ? (
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:20 }}>
                {selectedCards.map((card,i) => (
                  <div key={i} style={{ ...cs.card, padding:"10px 12px", textAlign:"center", flex:1 }}>
                    <div style={{ fontSize:"1.5rem" }}>{card.emoji}</div>
                    <div style={{ fontSize:"0.7rem", color:"rgba(180,120,255,0.6)", marginTop:4 }}>{["過去","現在","未来"][i]}</div>
                    <div style={{ fontSize:"0.8rem", color:"#e8d5ff", fontWeight:"bold" }}>{card.name}</div>
                  </div>
                ))}
              </div>
            ) : birthInfo && (
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:20 }}>
                {[
                  {label:"星座",val:`${birthInfo.zodiac.emoji} ${birthInfo.zodiac.name}`},
                  {label:"数秘",val:`No.${birthInfo.lifePath}`},
                  {label:"干支",val:`${birthInfo.eto}年`},
                ].map(item => (
                  <div key={item.label} style={{ ...cs.card, padding:"10px 12px", textAlign:"center", flex:1 }}>
                    <div style={{ fontSize:"0.7rem", color:"rgba(180,120,255,0.6)" }}>{item.label}</div>
                    <div style={{ fontSize:"0.9rem", color:"#ffd700", fontWeight:"bold", marginTop:4 }}>{item.val}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={cs.card}>
              <h2 style={{ fontSize:"1rem", marginBottom:16, letterSpacing:"0.1em", textAlign:"center", color:"#ffd700" }}>✦ 鑑定結果 ✦</h2>
              {loading ? (
                <div style={{ textAlign:"center", padding:"30px 0" }}>
                  <div style={{ width:50, height:50, border:"3px solid rgba(180,120,255,0.2)", borderTop:"3px solid #a855f7", borderRadius:"50%", margin:"0 auto 16px", animation:"spin 1s linear infinite" }}/>
                  <p style={{ color:"rgba(220,180,255,0.6)", fontSize:"0.9rem" }}>星の声を聞いています...</p>
                </div>
              ) : (
                <p style={{ lineHeight:2, color:"rgba(230,210,255,0.9)", fontSize:"0.92rem", whiteSpace:"pre-wrap" }}>{reading}</p>
              )}
            </div>
            {!loading && (
              <button style={{ ...cs.btn, marginTop:20 }} onClick={reset}>もう一度占う</button>
            )}
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:30, paddingBottom:20 }}>
          <p style={{ color:"rgba(180,120,255,0.3)", fontSize:"0.7rem", letterSpacing:"0.1em" }}>✦ POWERED BY AI ORACLE ✦</p>
        </div>
      </div>
    </div>
  );
}
