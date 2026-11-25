import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "shadcn Todo", description: "shadcn/ui + Lucide で作ったTodoアプリ" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ja" suppressHydrationWarning><body>{children}</body></html>);
}
