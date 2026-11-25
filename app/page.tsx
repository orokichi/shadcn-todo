"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, ListTodo, Moon, Plus, Search, Sun, Trash2, Pencil, X, Flag, CalendarDays, Sparkles, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Priority = "high" | "medium" | "low";
type Filter = "all" | "active" | "completed";
type Todo = { id: string; title: string; done: boolean; priority: Priority; due: string; createdAt: number };

const priorityLabel: Record<Priority, string> = { high: "高", medium: "中", low: "低" };
const priorityVariant: Record<Priority, "destructive" | "default" | "secondary"> = { high: "destructive", medium: "default", low: "secondary" };
const seed: Todo[] = [
  { id: "1", title: "shadcn/ui のコンポーネントを確認する", done: true, priority: "medium", due: "", createdAt: 1 },
  { id: "2", title: "Lucide アイコンを使ってみる", done: false, priority: "high", due: "", createdAt: 2 },
  { id: "3", title: "やることを追加してみる", done: false, priority: "low", due: "", createdAt: 3 },
];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(seed);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { try { const raw = localStorage.getItem("shadcn-todo-v1"); if (raw) setTodos(JSON.parse(raw)); const d = localStorage.getItem("shadcn-todo-dark"); if (d === "1") setDark(true); } catch {} setLoaded(true); }, []);
  useEffect(() => { if (loaded) localStorage.setItem("shadcn-todo-v1", JSON.stringify(todos)); }, [todos, loaded]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("shadcn-todo-dark", dark ? "1" : "0"); }, [dark]);

  const visible = useMemo(() => todos.filter(t => (filter === "all" || (filter === "active" ? !t.done : t.done)) && t.title.includes(query.trim())).sort((a,b) => Number(a.done)-Number(b.done) || a.createdAt-b.createdAt), [todos, filter, query]);
  const doneCount = todos.filter(t => t.done).length;

  function add() { const t = title.trim(); if (!t) return; setTodos(p => [...p, { id: crypto.randomUUID(), title: t, done: false, priority, due, createdAt: Date.now() }]); setTitle(""); setDue(""); }
  function saveEdit(id: string) { const t = editTitle.trim(); if (t) setTodos(p => p.map(x => x.id===id ? {...x, title:t} : x)); setEditing(null); }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2"><ListTodo className="h-7 w-7" /><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">shadcn Todo</h1></div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> shadcn/ui + Lucide で作った、シンプルなTodoアプリ</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setDark(!dark)} aria-label="テーマ切替">{dark ? <Sun /> : <Moon />}</Button>
        </header>

        <Card>
          <CardHeader><CardTitle>新しいTodo</CardTitle><CardDescription>Enterキーでも追加できます。データはこの端末に自動保存されます。</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add();}} placeholder="やることを入力…" className="flex-1" />
              <Button onClick={add}><Plus /> 追加</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Flag className="h-3.5 w-3.5" /> 優先度</span>
              {(["high","medium","low"] as Priority[]).map(p => (<Button key={p} size="sm" variant={priority===p?"default":"outline"} onClick={()=>setPriority(p)}>{priorityLabel[p]}</Button>))}
              <span className="ml-2 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> 期限</span>
              <Input type="date" value={due} onChange={e=>setDue(e.target.value)} className="h-8 w-auto" />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-44"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="検索…" className="pl-9 bg-background" /></div>
          {([["all","すべて"],["active","未完了"],["completed","完了"]] as [Filter,string][]).map(([f,label]) => (<Button key={f} size="sm" variant={filter===f?"default":"outline"} onClick={()=>setFilter(f)}>{label}</Button>))}
        </div>

        <Card>
          <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">Todo一覧</CardTitle><Badge variant="secondary">{doneCount} / {todos.length} 完了</Badge></div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all" style={{width: todos.length? `${(doneCount/todos.length)*100}%` : "0%"}} /></div></CardHeader>
          <CardContent className="space-y-2">
            {visible.length===0 && (<div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground"><Circle className="h-8 w-8" /><p className="text-sm">Todoがありません。上の欄から追加してみてね。</p></div>)}
            {visible.map(t => (
              <div key={t.id} className={cn("flex items-center gap-3 rounded-lg border bg-card p-3", t.done && "opacity-60")}>
                <Checkbox checked={t.done} onCheckedChange={v=>setTodos(p=>p.map(x=>x.id===t.id?{...x,done:Boolean(v)}:x))} />
                {editing===t.id ? (<><Input value={editTitle} onChange={e=>setEditTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(t.id); if(e.key==="Escape")setEditing(null);}} className="flex-1" autoFocus /><Button size="icon" variant="ghost" onClick={()=>saveEdit(t.id)}><CheckCircle2 /></Button><Button size="icon" variant="ghost" onClick={()=>setEditing(null)}><X /></Button></>) : (<>
                  <span className={cn("flex-1 text-sm", t.done && "line-through")}>{t.title}</span>
                  {t.due && <Badge variant="outline">{t.due}</Badge>}
                  <Badge variant={priorityVariant[t.priority]}>{priorityLabel[t.priority]}</Badge>
                  <Button size="icon" variant="ghost" onClick={()=>{setEditing(t.id); setEditTitle(t.title);}} aria-label="編集"><Pencil /></Button>
                  <Button size="icon" variant="ghost" onClick={()=>setTodos(p=>p.filter(x=>x.id!==t.id))} aria-label="削除"><Trash2 className="text-destructive" /></Button>
                </>)}
              </div>
            ))}
            {doneCount>0 && (<div className="pt-2 text-right"><Button size="sm" variant="outline" onClick={()=>setTodos(p=>p.filter(x=>!x.done))}><Eraser /> 完了済みをまとめて削除</Button></div>)}
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">Built with shadcn/ui (zinc) · Lucide icons · Next.js</p>
      </div>
    </main>
  );
}
