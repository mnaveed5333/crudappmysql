"use client";

import { useEffect, useState, useMemo } from "react";

const PRIORITY_STYLES = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isDaily, setIsDaily] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/todos")
      .then(async (res) => {
        if (!res.ok) {
          setError("Could not load tasks (not logged in yet?).");
          return { tasks: [] };
        }
        return res.json();
      })
      .then((data) => setTasks(data.tasks || []))
      .finally(() => setLoading(false));
  }, []);

  const todayKey = new Date().toDateString();

  const visibleTasks = useMemo(() => {
    return tasks.filter(Boolean).map((t) =>
      t.isDaily && t.completed && t.lastCompletedAt !== todayKey
        ? { ...t, completed: false }
        : t
    );
  }, [tasks, todayKey]);

  const activeCount = visibleTasks.filter((t) => !t.completed).length;
  const doneCount = visibleTasks.filter((t) => t.completed).length;
  const progress = visibleTasks.length ? Math.round((doneCount / visibleTasks.length) * 100) : 0;

  const filtered = visibleTasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  async function addTask(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), priority, isDaily }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add task.");
      return;
    }
    setTasks((prev) => [data.task, ...prev]);
    setText("");
    setIsDaily(false);
    setPriority("medium");
  }

  async function toggleTask(task) {
    setError("");
    const completed = !task.completed;
    const res = await fetch(`/api/todos/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed, lastCompletedAt: completed ? todayKey : task.lastCompletedAt }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update task.");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditText(task.text);
  }

  async function saveEdit(id) {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }
    setError("");
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText.trim() }),
    });
    const data = await res.json();
    setEditingId(null);
    if (!res.ok) {
      setError(data.error || "Could not save edit.");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
  }

  async function deleteTask(id) {
    setError("");
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete task.");
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading tasks...</div>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && <div className="mb-4 rounded-lg bg-danger-light px-4 py-2 text-sm text-danger">{error}</div>}

      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Today</h2>
        <span className="text-sm text-slate-500">{doneCount} of {visibleTasks.length} done</span>
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <form onSubmit={addTask} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-primary">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label className="flex items-center gap-1 whitespace-nowrap text-sm text-slate-600">
          <input type="checkbox" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)} />
          Daily
        </label>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover">Add</button>
      </form>

      <div className="mb-4 flex gap-2 text-sm">
        <button onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 ${filter === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          All <span className="opacity-75">{visibleTasks.length}</span>
        </button>
        <button onClick={() => setFilter("active")}
          className={`rounded-full px-3 py-1 ${filter === "active" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          Active <span className="opacity-75">{activeCount}</span>
        </button>
        <button onClick={() => setFilter("done")}
          className={`rounded-full px-3 py-1 ${filter === "done" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          Done <span className="opacity-75">{doneCount}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            {filter === "done" ? "Nothing marked done yet." : filter === "active" ? "No active tasks." : "No tasks here. Add one above."}
          </p>
        )}
        {filtered.map((task) => (
          <div key={task.id}
            className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 ${
              task.completed ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
            }`}>
            <button
              onClick={() => toggleTask(task)}
              aria-label={task.completed ? "Mark as not done" : "Mark as done"}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                task.completed ? "border-success bg-success text-white" : "border-slate-300 hover:border-primary"
              }`}
            >
              {task.completed && "✓"}
            </button>

            {editingId === task.id ? (
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => saveEdit(task.id)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                autoFocus
                className="flex-1 rounded border border-primary px-2 py-1 text-sm outline-none"
              />
            ) : (
              <p
                onDoubleClick={() => startEdit(task)}
                className={`flex-1 truncate text-sm ${task.completed ? "text-slate-400 line-through" : "text-ink"}`}
              >
                {task.text}
              </p>
            )}

            {task.isDaily ? (
              <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">Daily</span>
            ) : (
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
                {task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Medium"}
              </span>
            )}

            <button onClick={() => startEdit(task)} aria-label="Edit task" className="shrink-0 text-slate-400 hover:text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button onClick={() => deleteTask(task.id)} aria-label="Delete task" className="shrink-0 text-slate-400 hover:text-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}