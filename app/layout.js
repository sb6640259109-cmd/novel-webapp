import "./globals.css";

export const metadata = {
  title: "NovelLib — โลกนิยายที่เป็นของคุณ",
  description: "ค้นพบ อ่าน และจัดเก็บนิยายเรื่องโปรดในพื้นที่อ่านที่สดใสและทันสมัย",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
