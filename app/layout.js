export const metadata = {
  title: "星詠みタロット",
  description: "AIが導く本格タロット占い",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
