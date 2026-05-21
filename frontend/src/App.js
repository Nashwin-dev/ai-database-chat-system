import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Label,
  Legend
} from "recharts";

const COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444"
];

const RenderGraph = ({ data, type }) => {
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);
  const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('label')) || keys[0];
  const valueKey = keys.find(k => typeof data[0][k] === "number") || keys[1];

  // Logic: 90px per data point ensures text never overlaps
  const dynamicWidth = Math.max(data.length * 90, 1000); 
  const chartTitle = `${valueKey.replace('_', ' ')} BY ${nameKey.replace('_', ' ')}`.toUpperCase();

  return (
    <div className="graph-container">
      <h3 style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '24px' }}>{chartTitle}</h3>

      {/* NEW: Use the scrollable class from CSS */}
      <div className="scrollable-chart-wrapper">
        <div style={{ width: `${dynamicWidth}px`, minWidth: '100%' }}>
          <ResponsiveContainer width="100%" height={600}>
            
            {/* BAR CHART SECTION */}
            {type === "bar" && (
              <BarChart data={data} margin={{ top: 20, right: 50, left: 40, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey={nameKey}
                  stroke="var(--text-muted)"
                  height={150} // More room for rotated names
                  interval={0}
                  tick={{ fontSize: 16, fill: 'var(--text-muted)' }}
                  angle={-45}
                  textAnchor="end"
                  dy={20}
                >
                  <Label
                    value={nameKey.toUpperCase()}
                    offset={-90} // Adjusted for larger height
                    position="insideBottom"
                    style={{ fill: 'var(--accent)', fontWeight: 'bold', fontSize: '18px' }}
                  />
                </XAxis>
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 16 }}>
                  <Label
                    value={valueKey.toUpperCase()}
                    angle={-90}
                    position="insideLeft"
                    style={{ fill: 'var(--accent)', fontWeight: 'bold', fontSize: '18px', textAnchor: 'middle' }}
                  />
                </YAxis>
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", fontSize: '18px' }} />
                <Bar dataKey={valueKey} fill="var(--accent)" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            )}

            {/* LINE CHART SECTION */}
            {type === "line" && (
              <LineChart data={data} margin={{ top: 20, right: 50, left: 40, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey={nameKey} stroke="var(--text-muted)" height={150} interval={0} tick={{ fontSize: 16 }} angle={-45} textAnchor="end" dy={20}>
                  <Label value={nameKey.toUpperCase()} offset={-90} position="insideBottom" style={{ fill: 'var(--accent)', fontWeight: 'bold', fontSize: '18px' }} />
                </XAxis>
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 16 }}>
                  <Label value={valueKey.toUpperCase()} angle={-90} position="insideLeft" style={{ fill: 'var(--accent)', fontWeight: 'bold', fontSize: '18px' }} />
                </YAxis>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", fontSize: '18px' }} />
                <Line type="monotone" dataKey={valueKey} stroke="var(--accent)" strokeWidth={5} dot={{ r: 8 }} />
              </LineChart>
            )}

            {/* PIE CHART SECTION */}
            {(type === "pie" || type === "donut") && (
              <PieChart>
                <Pie
                  data={data}
                  dataKey={valueKey}
                  nameKey={nameKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={180}
                  innerRadius={type === "donut" ? 100 : 0}
                  paddingAngle={5}
                  label={(entry) => entry[nameKey]}
                  labelStyle={{ fontSize: '18px', fontWeight: 'bold', fill: 'var(--text-muted)' }}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", fontSize: '18px' }} />
                <Legend wrapperStyle={{ fontSize: '18px', paddingTop: '30px' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN APP ---------------- */

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [schema, setSchema] = useState({ database: "", tables: [] });
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  /* Auto scroll */
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Load tables dynamically */
  useEffect(() => {
    fetch("http://127.0.0.1:5000/tables")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setSchema(data);
      })
      .catch((err) =>
        console.error("Metadata Load Error:", err)
      );
  }, []);

  /* Handle Ask */
  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    const currentQ = question;

    // Create a clean history for the AI
    const history = messages.slice(-4).map(m => {
      if (m.sender === "bot" && m.data) {
        // Tell the AI exactly what entity and type we just used
        const entityInfo = m.text.toLowerCase().includes("medication") ? "medications" : "current table";
        const contextSnippet = `I previously showed a ${m.type} for ${entityInfo}. Data found: ${m.data.map(d => d.NAME || d.name || d.doc_id).slice(0, 3).join(", ")}`;
        return { role: "assistant", content: contextSnippet };
      }
      return { role: "user", content: m.text };
    });

    setMessages(prev => [...prev, { sender: "user", text: currentQ }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ,
          history: history // Send history to backend
        }),
      });
      // ... rest of your fetch logic

      const result = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          data: result.data || null,
          type: result.type || "text",
          text:
            result.text ||
            result.error ||
            "Query completed successfully.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Backend connection failed.",
        },
      ]);
    }

    setLoading(false);
  };

  /* Render Table */
  const renderTable = (data) => {
    if (!data || !data.length)
      return <p>No data found.</p>;

    const headers = Object.keys(data[0]);

    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {headers.map((h) => (
                  <td key={h}>
                    {String(row[h] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="layout">
      {/* ---------- TOP BAR ---------- */}
      <div className="topbar">
        <div className="brand-center">
          <div className="brand-logo">⚡</div>
          <h1>QueryNest</h1>
          <span>Your Personal Database Manager</span>
        </div>

        <div className="top-actions">
          <div className="status-pill">
            🟢 Connected (MySQL)
          </div>
          <div className="model-pill">
            ⚡ Llama-3.3
          </div>
        </div>
      </div>

      {/* ---------- BODY ---------- */}
      <div className="body-container">
        {/* ---------- SIDEBAR ---------- */}
        <div className="sidebar">
          <h4>Database Explorer</h4>

          <div className="db-card">
            {schema.database || "Connecting..."}
          </div>

          <div className="menu">
            <p>Tables</p>
            <ul>
              {schema.tables.map((table, index) => (
                <li
                  key={index}
                  onClick={() =>
                    setQuestion(
                      `Show all data from ${table}`
                    )
                  }
                >
                  🧩 {table}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- MAIN ---------- */}
        <div className="main">
          <div className="chat-area">
            {messages.length === 0 && (
              <div className="empty-state">
                <h2>Welcome 👋</h2>
                <p>
                  I'm your AI database assistant.
                  What would you like to explore
                  today?
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-row ${msg.sender}`}>
                <div className="bubble-content">
                  <div className="avatar">
                    {msg.sender === "user" ? "U" : "AI"}
                  </div>

                  <div className="msg-body">
                    {/* Render text response if available */}
                    {msg.text && <p>{msg.text}</p>}

                    {/* 1. Render Graph if the type is not a table or plain text */}
                    {msg.type !== "table" && msg.type !== "text" && msg.data && msg.data.length > 0 && (
                      <RenderGraph data={msg.data} type={msg.type} />
                    )}

                    {/* 2. DIRECT TABLE RENDER: Data is now visible immediately */}
                    {msg.data && msg.data.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        {renderTable(msg.data)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row bot">
                <div className="bubble-content">
                  <div className="avatar">AI</div>
                  <div className="msg-body">
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            <div ref={chatRef}></div>
          </div>

          {/* ---------- FIXED INPUT ---------- */}
          <div className="input-container">
            <div className="input-box">
              <input
                placeholder="Ask anything about your database..."
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAsk()
                }
                disabled={loading}
              />
              <button onClick={handleAsk} disabled={loading}>
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;