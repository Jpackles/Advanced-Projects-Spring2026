"use client";

import { useState, useEffect } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function CGPSLogo() {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 10,
      background: "#2d3f6b",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
    }}>
      <div style={{
        fontFamily: "'Georgia', serif",
        fontSize: 18, fontWeight: 900,
        color: "#fff", letterSpacing: "-0.03em",
        lineHeight: 1,
      }}>CGPS</div>
      <div style={{
        width: 22, height: 3, borderRadius: 2,
        background: "#29b6e8", marginTop: 4,
      }} />
    </div>
  );
}

function Badge({ day }: { day: string }) {
  const colors: Record<string, string> = {
    Monday: "#2d3f6b",
    Tuesday: "#1a5fa8",
    Wednesday: "#29b6e8",
    Thursday: "#1a7abf",
    Friday: "#0e4d8a",
  };
  return (
    <span style={{
      background: colors[day] || "#2d3f6b",
      color: "#fff",
      borderRadius: "6px",
      padding: "2px 10px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
    }}>{day}</span>
  );
}

export default function OfficeHours() {
  const [view, setView] = useState("student");
  const [entries, setEntries] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("cgps_officeHours") || "[]"); }
    catch { return []; }
  });
  const [form, setForm] = useState({ name: "", class: "", day: "Monday", start: "", end: "", room: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("");
  const [attested, setAttested] = useState(false); // tracks whether student has checked the checkbox

  useEffect(() => {
    localStorage.setItem("cgps_officeHours", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = () => {
    if (!form.name || !form.class || !form.start || !form.end || !form.room) return;
    if (editId !== null) {
      setEntries(prev => prev.map(e => e.id === editId ? { ...form, id: editId } : e));
      setEditId(null);
    } else {
      setEntries(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setForm({ name: "", class: "", day: "Monday", start: "", end: "", room: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleEdit = (entry: any) => {
    setForm({ name: entry.name, class: entry.class, day: entry.day, start: entry.start, end: entry.end, room: entry.room });
    setEditId(entry.id);
    setView("teacher");
  };

  const handleDelete = (id: number) => setEntries(prev => prev.filter(e => e.id !== id));

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) ||
    e.class.toLowerCase().includes(filter.toLowerCase()) ||
    e.day.toLowerCase().includes(filter.toLowerCase()) ||
    e.room.toLowerCase().includes(filter.toLowerCase())
  );

  const grouped = DAYS.reduce((acc: Record<string, any[]>, day) => {
    const d = filtered.filter(e => e.day === day);
    if (d.length) acc[day] = d;
    return acc;
  }, {});

  const inputStyle = {
    width: "100%",
    background: "#fff",
    border: "1.5px solid #d0d9e8",
    borderRadius: 8,
    padding: "11px 14px",
    color: "#1a2a4a",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#7a8aaa",
    textTransform: "uppercase", letterSpacing: "0.09em",
    display: "block", marginBottom: 6,
    fontFamily: "'Georgia', serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8", fontFamily: "'Georgia', serif", color: "#1a2a4a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&display=swap');
        ::placeholder { color: #b0bcd0; }
        input, select { outline: none; }
        button { cursor: pointer; }
        .entry-card { transition: box-shadow 0.18s, transform 0.15s; }
        .entry-card:hover { box-shadow: 0 6px 24px rgba(45,63,107,0.13); transform: translateY(-2px); }
        input[type=time]::-webkit-calendar-picker-indicator { opacity: 0.4; }
      `}</style>

      <div style={{ background: "linear-gradient(135deg, #1e2e52 0%, #2d3f6b 60%, #1a5fa8 100%)", boxShadow: "0 2px 16px rgba(30,46,82,0.18)" }}>
        <div style={{ height: 4, background: "#29b6e8" }} />
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "22px 28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <CGPSLogo />
            <div>
              <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, color: "#29b6e8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                Columbia Grammar & Preparatory School
              </div>
              <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1 }}>
                Teacher Office Hours
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[{ id: "student", label: "📋 Student View" }, { id: "teacher", label: "✏️ Teacher Form" }].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{
                background: view === tab.id ? "#f0f3f8" : "transparent",
                color: view === tab.id ? "#1e2e52" : "rgba(255,255,255,0.6)",
                border: "none", borderRadius: "8px 8px 0 0",
                padding: "10px 22px", fontFamily: "'Georgia', serif",
                fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 28px" }}>

        {view === "student" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1e2e52" }}>This Week's Schedule</div>
                <div style={{ fontSize: 13, color: "#7a8aaa", marginTop: 3 }}>{entries.length} teacher{entries.length !== 1 ? "s" : ""} have posted office hours</div>
              </div>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search teacher, class, room…"
                style={{ ...inputStyle, width: 240, boxShadow: "0 1px 4px rgba(45,63,107,0.07)" }} />
            </div>

            {/* Attestation checkbox — student must check this before seeing the schedule */}
            <div style={{
              background: "#fff",
              border: `1.5px solid ${attested ? "#29b6e8" : "#d0d9e8"}`,
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 1px 6px rgba(45,63,107,0.06)",
              transition: "border-color 0.2s",
            }}>
              <input
                type="checkbox"
                id="attest"
                checked={attested}
                onChange={e => setAttested(e.target.checked)} // updates attested state when clicked
                style={{ width: 18, height: 18, accentColor: "#29b6e8", cursor: "pointer", flexShrink: 0 }}
              />
              <label htmlFor="attest" style={{ fontSize: 14, color: "#1e2e52", fontWeight: 600, cursor: "pointer" }}>
                I confirm I am not currently in class and am free to visit office hours
              </label>
            </div>

            {/* only shows the schedule if the checkbox is checked */}
            {!attested ? (
              <div style={{
                background: "#fff",
                border: "1.5px dashed #c8d4e8",
                borderRadius: 14,
                padding: "40px 24px",
                textAlign: "center",
                color: "#b0bcd0",
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>☝️</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#7a8aaa" }}>Please check the box above to view office hours</div>
              </div>
            ) : (
              <div>
                {Object.keys(grouped).length === 0 && (
                  <div style={{ background: "#fff", border: "1.5px dashed #c8d4e8", borderRadius: 14, padding: "56px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 38, marginBottom: 12 }}>📭</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#7a8aaa" }}>No office hours posted yet</div>
                    <div style={{ fontSize: 13, marginTop: 6, color: "#b0bcd0" }}>Teachers can add hours using the Teacher Form tab</div>
                  </div>
                )}

                {DAYS.filter(d => grouped[d]).map(day => (
                  <div key={day} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <Badge day={day} />
                      <div style={{ flex: 1, height: 1, background: "#d0d9e8" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {grouped[day].map((entry: any) => (
                        <div key={entry.id} className="entry-card" style={{
                          background: "#fff", border: "1.5px solid #e0e8f4", borderRadius: 12,
                          padding: "16px 20px", display: "flex", alignItems: "center",
                          justifyContent: "space-between", flexWrap: "wrap", gap: 14,
                          boxShadow: "0 1px 6px rgba(45,63,107,0.06)",
                        }}>
                          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 10,
                              background: "linear-gradient(135deg, #e8eef8, #d0ddef)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 20, flexShrink: 0, border: "1.5px solid #c8d4e8",
                            }}>👤</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e2e52" }}>{entry.name}</div>
                              <div style={{ fontSize: 13, color: "#7a8aaa", marginTop: 2 }}>{entry.class}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 10, color: "#b0bcd0", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>Time</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a5fa8", marginTop: 2 }}>{formatTime(entry.start)} – {formatTime(entry.end)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: "#b0bcd0", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>Room</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#29b6e8", marginTop: 2 }}>{entry.room}</div>
                            </div>
                            <button onClick={() => handleEdit(entry)} style={{
                              background: "#f0f3f8", color: "#7a8aaa", border: "1.5px solid #d0d9e8",
                              borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif",
                            }}>Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "teacher" && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1e2e52" }}>
                {editId ? "Update Office Hours" : "Post Your Office Hours"}
              </div>
              <div style={{ fontSize: 13, color: "#7a8aaa", marginTop: 4 }}>
                {editId ? "Update your information below and save." : "Students will see your hours on the schedule board."}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Teacher Name", key: "name", placeholder: "e.g. Ms. Johnson" },
                { label: "Class / Subject", key: "class", placeholder: "e.g. AP Biology" },
                { label: "Room", key: "room", placeholder: "e.g. Room 204" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type="text" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} style={{ ...inputStyle, boxShadow: "0 1px 4px rgba(45,63,107,0.06)" }} />
                </div>
              ))}

              <div>
                <label style={labelStyle}>Day</label>
                <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                  style={{ ...inputStyle, appearance: "none", boxShadow: "0 1px 4px rgba(45,63,107,0.06)" }}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[{ label: "Start Time", key: "start" }, { label: "End Time", key: "end" }].map(({ label, key }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type="time" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ ...inputStyle, boxShadow: "0 1px 4px rgba(45,63,107,0.06)" }} />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <button onClick={handleSubmit} style={{
                  flex: 1, background: "linear-gradient(135deg, #1e2e52, #1a5fa8)",
                  color: "#fff", border: "none", borderRadius: 10, padding: "14px",
                  fontSize: 15, fontWeight: 700, fontFamily: "'Georgia', serif",
                  boxShadow: "0 2px 10px rgba(30,46,82,0.18)",
                }}>{editId ? "Update Hours" : "Post Hours"}</button>
                {editId && (
                  <button onClick={() => { setEditId(null); setForm({ name: "", class: "", day: "Monday", start: "", end: "", room: "" }); }} style={{
                    background: "#f0f3f8", color: "#7a8aaa", border: "1.5px solid #d0d9e8",
                    borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'Georgia', serif",
                  }}>Cancel</button>
                )}
              </div>

              {saved && (
                <div style={{
                  background: "rgba(41,182,232,0.10)", border: "1.5px solid rgba(41,182,232,0.35)",
                  borderRadius: 9, padding: "12px 16px", fontSize: 14, color: "#1a7abf", fontWeight: 700, textAlign: "center",
                }}>✓ Office hours posted successfully!</div>
              )}
            </div>

            {entries.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7a8aaa", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>
                  Manage Existing Hours
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {entries.map((entry: any) => (
                    <div key={entry.id} style={{
                      background: "#fff", border: "1.5px solid #e0e8f4", borderRadius: 10,
                      padding: "12px 16px", display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: 12, boxShadow: "0 1px 4px rgba(45,63,107,0.05)",
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1e2e52" }}>{entry.name}</span>
                        <span style={{ color: "#c8d4e8", margin: "0 6px" }}>·</span>
                        <span style={{ fontSize: 13, color: "#7a8aaa" }}>{entry.class}</span>
                        <div style={{ marginTop: 5 }}>
                          <Badge day={entry.day} />
                          <span style={{ fontSize: 12, color: "#1a5fa8", marginLeft: 8, fontWeight: 600 }}>
                            {formatTime(entry.start)} – {formatTime(entry.end)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => handleEdit(entry)} style={{
                          background: "#f0f3f8", color: "#7a8aaa", border: "1.5px solid #d0d9e8",
                          borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif",
                        }}>Edit</button>
                        <button onClick={() => handleDelete(entry.id)} style={{
                          background: "rgba(220,60,60,0.07)", color: "#c0392b", border: "1.5px solid rgba(220,60,60,0.18)",
                          borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif",
                        }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "24px", borderTop: "1.5px solid #d0d9e8", fontSize: 12, color: "#b0bcd0", fontFamily: "'Georgia', serif" }}>
        Columbia Grammar & Preparatory School · Office Hours Portal
      </div>
    </div>
  );
}