"use client"; // tells Next.js this file runs in the browser, not on the server

import { useState, useEffect } from "react"; // useState lets us store data, useEffect lets us run code when something changes

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // list of days used to group office hours

// converts 24hr time (e.g. 13:00) to 12hr time (e.g. 1:00 PM)
function formatTime(t: string) {
  if (!t) return ""; // if no time is given, return nothing
  const [h, m] = t.split(":").map(Number); // split "13:00" into hours=13 and minutes=0
  const ampm = h >= 12 ? "PM" : "AM"; // if hour is 12 or more it's PM, otherwise AM
  const hour = h % 12 || 12; // convert 13 to 1, 0 to 12, etc.
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`; // return formatted time like "1:00 PM"
}

// draws the CGPS logo box in the header
function CGPSLogo() {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 10,
      background: "#2d3f6b", // navy background color
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
        background: "#29b6e8", marginTop: 4, // blue underline beneath CGPS text
      }} />
    </div>
  );
}

// draws the colored day badge (e.g. blue "MONDAY" pill)
function Badge({ day }: { day: string }) {
  const colors: Record<string, string> = { // each day gets its own color
    Monday: "#2d3f6b",
    Tuesday: "#1a5fa8",
    Wednesday: "#29b6e8",
    Thursday: "#1a7abf",
    Friday: "#0e4d8a",
  };
  return (
    <span style={{
      background: colors[day] || "#2d3f6b", // use the day's color, fallback to navy
      color: "#fff",
      borderRadius: "6px",
      padding: "2px 10px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.07em",
      textTransform: "uppercase", // makes text all caps
    }}>{day}</span>
  );
}

export default function OfficeHours() {
  const [view, setView] = useState("student"); // tracks which tab is active: "student" or "teacher"

  const [entries, setEntries] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("cgps_officeHours") || "[]"); } // loads saved office hours from the browser on page load
    catch { return []; } // if something goes wrong, start with an empty list
  });

  const [form, setForm] = useState({ name: "", class: "", day: "Monday", start: "", end: "", room: "" }); // stores what the teacher is typing into the form
  const [editId, setEditId] = useState<number | null>(null); // stores the id of the entry being edited, or null if creating new
  const [saved, setSaved] = useState(false); // controls whether the "saved!" message shows
  const [filter, setFilter] = useState(""); // stores what the student is typing in the search bar
  const [attested, setAttested] = useState(false); // tracks whether the student has checked the box, starts as false (unchecked)

  useEffect(() => {
    localStorage.setItem("cgps_officeHours", JSON.stringify(entries)); // saves office hours to the browser every time the list changes
  }, [entries]); // the [entries] means this runs whenever entries changes

  const handleSubmit = () => {
    if (!form.name || !form.class || !form.start || !form.end || !form.room) return; // stops submission if any field is empty
    if (editId !== null) {
      setEntries(prev => prev.map(e => e.id === editId ? { ...form, id: editId } : e)); // if editing, replace the matching entry with updated form data
      setEditId(null); // clear the edit mode
    } else {
      setEntries(prev => [...prev, { ...form, id: Date.now() }]); // if new, add the form data to the list with a unique id
    }
    setForm({ name: "", class: "", day: "Monday", start: "", end: "", room: "" }); // clear the form after submitting
    setSaved(true); // show the "saved!" message
    setTimeout(() => setSaved(false), 2500); // hide the "saved!" message after 2.5 seconds
  };

  const handleEdit = (entry: any) => {
    setForm({ name: entry.name, class: entry.class, day: entry.day, start: entry.start, end: entry.end, room: entry.room }); // fill the form with the entry's existing data
    setEditId(entry.id); // remember which entry we're editing
    setView("teacher"); // switch to the teacher form tab
  };

  const handleDelete = (id: number) => setEntries(prev => prev.filter(e => e.id !== id)); // removes the entry with the matching id from the list

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) || // check if teacher name matches search
    e.class.toLowerCase().includes(filter.toLowerCase()) || // check if class matches search
    e.day.toLowerCase().includes(filter.toLowerCase()) || // check if day matches search
    e.room.toLowerCase().includes(filter.toLowerCase()) // check if room matches search
  );

  const grouped = DAYS.reduce((acc: Record<string, any[]>, day) => {
    const d = filtered.filter(e => e.day === day); // get all entries for this day
    if (d.length) acc[day] = d; // only add the day to the group if it has entries
    return acc;
  }, {}); // groups entries by day so they display under Monday, Tuesday etc.

  const inputStyle = { // reusable style object for all text inputs
    width: "100%",
    background: "#fff",
    border: "1.5px solid #d0d9e8",
    borderRadius: 8,
    padding: "11px 14px",
    color: "#1a2a4a",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
  };

  const labelStyle: React.CSSProperties = { // reusable style object for all form labels
    fontSize: 11, fontWeight: 700, color: "#7a8aaa",
    textTransform: "uppercase", letterSpacing: "0.09em",
    display: "block", marginBottom: 6,
    fontFamily: "'Georgia', serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8", fontFamily: "'Georgia', serif", color: "#1a2a4a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&display=swap'); /* loads the EB Garamond font from Google */
        ::placeholder { color: #b0bcd0; } /* styles the placeholder text in inputs */
        input, select { outline: none; } /* removes the default blue outline on focus */
        button { cursor: pointer; } /* makes buttons show a hand cursor on hover */
        .entry-card { transition: box-shadow 0.18s, transform 0.15s; } /* smooth animation for card hover effect */
        .entry-card:hover { box-shadow: 0 6px 24px rgba(45,63,107,0.13); transform: translateY(-2px); } /* lifts card up slightly on hover */
        input[type=time]::-webkit-calendar-picker-indicator { opacity: 0.4; } /* makes the time picker icon less prominent */
      `}</style>

      {/* Header — navy gradient bar at the top with logo and tabs */}
      <div style={{ background: "linear-gradient(135deg, #1e2e52 0%, #2d3f6b 60%, #1a5fa8 100%)", boxShadow: "0 2px 16px rgba(30,46,82,0.18)" }}>
        <div style={{ height: 4, background: "#29b6e8" }} /> {/* thin blue accent line at very top */}
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "22px 28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <CGPSLogo /> {/* renders the CGPS logo box */}
            <div>
              <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, color: "#29b6e8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                Columbia Grammar & Preparatory School
              </div>
              <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1 }}>
                Teacher Office Hours
              </div>
            </div>
          </div>
          {/* renders the Student View and Teacher Form tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {[{ id: "student", label: "📋 Student View" }, { id: "teacher", label: "✏️ Teacher Form" }].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{
                background: view === tab.id ? "#f0f3f8" : "transparent", // active tab is white, inactive is transparent
                color: view === tab.id ? "#1e2e52" : "rgba(255,255,255,0.6)", // active tab is dark, inactive is faded white
                border: "none", borderRadius: "8px 8px 0 0",
                padding: "10px 22px", fontFamily: "'Georgia', serif",
                fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 28px" }}>

        {/* Student View — only shows when view is "student" */}
        {view === "student" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1e2e52" }}>This Week's Schedule</div>
                <div style={{ fontSize: 13, color: "#7a8aaa", marginTop: 3 }}>{entries.length} teacher{entries.length !== 1 ? "s" : ""} have posted office hours</div> {/* shows count of teachers */}
              </div>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search teacher, class, room…"
                style={{ ...inputStyle, width: 240, boxShadow: "0 1px 4px rgba(45,63,107,0.07)" }} /> {/* search bar — updates filter state as you type */}
            </div>

            {/* Attestation checkbox — student must check this before the schedule appears */}
            <div style={{
              background: "#fff",
              border: `1.5px solid ${attested ? "#29b6e8" : "#d0d9e8"}`, // border turns blue when checked
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 1px 6px rgba(45,63,107,0.06)",
              transition: "border-color 0.2s", // smooth color change when checkbox is clicked
            }}>
              <input
                type="checkbox"
                id="attest"
                checked={attested} // controlled by the attested state
                onChange={e => setAttested(e.target.checked)} // updates attested to true or false when clicked
                style={{ width: 18, height: 18, accentColor: "#29b6e8", cursor: "pointer", flexShrink: 0 }}
              />
              <label htmlFor="attest" style={{ fontSize: 14, color: "#1e2e52", fontWeight: 600, cursor: "pointer" }}>
                I confirm I am not currently in class and am free to visit office hours
              </label>
            </div>

            {/* if checkbox is not checked, show a message instead of the schedule */}
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
              // if checkbox is checked, show the full schedule below
              <div>
                {/* shows empty state if no entries match the search */}
                {Object.keys(grouped).length === 0 && (
                  <div style={{ background: "#fff", border: "1.5px dashed #c8d4e8", borderRadius: 14, padding: "56px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 38, marginBottom: 12 }}>📭</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#7a8aaa" }}>No office hours posted yet</div>
                    <div style={{ fontSize: 13, marginTop: 6, color: "#b0bcd0" }}>Teachers can add hours using the Teacher Form tab</div>
                  </div>
                )}

                {/* loops through each day and shows entries grouped under it */}
                {DAYS.filter(d => grouped[d]).map(day => (
                  <div key={day} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <Badge day={day} /> {/* colored day label */}
                      <div style={{ flex: 1, height: 1, background: "#d0d9e8" }} /> {/* horizontal divider line */}
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
                            }}>👤</div> {/* teacher avatar icon */}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e2e52" }}>{entry.name}</div> {/* teacher name */}
                              <div style={{ fontSize: 13, color: "#7a8aaa", marginTop: 2 }}>{entry.class}</div> {/* class name */}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 10, color: "#b0bcd0", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>Time</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a5fa8", marginTop: 2 }}>{formatTime(entry.start)} – {formatTime(entry.end)}</div> {/* formatted start and end time */}
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: "#b0bcd0", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>Room</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#29b6e8", marginTop: 2 }}>{entry.room}</div> {/* room number */}
                            </div>
                            <button onClick={() => handleEdit(entry)} style={{ // edit button — loads this entry into the teacher form
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

        {/* Teacher Form — only shows when view is "teacher" */}
        {view === "teacher" && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1e2e52" }}>
                {editId ? "Update Office Hours" : "Post Your Office Hours"} {/* changes title based on whether editing or creating */}
              </div>
              <div style={{ fontSize: 13, color: "#7a8aaa", marginTop: 4 }}>
                {editId ? "Update your information below and save." : "Students will see your hours on the schedule board."}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* loops through the three text fields and renders each one */}
              {[
                { label: "Teacher Name", key: "name", placeholder: "e.g. Ms. Johnson" },
                { label: "Class / Subject", key: "class", placeholder: "e.g. AP Biology" },
                { label: "Room", key: "room", placeholder: "e.g. Room 204" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type="text" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} // updates the form state as the teacher types
                    placeholder={placeholder} style={{ ...inputStyle, boxShadow: "0 1px 4px rgba(45,63,107,0.06)" }} />
                </div>
              ))}

              {/* day dropdown */}
              <div>
                <label style={labelStyle}>Day</label>
                <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} // updates the day in form state when selected
                  style={{ ...inputStyle, appearance: "none", boxShadow: "0 1px 4px rgba(45,63,107,0.06)" }}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)} {/* renders each day as a dropdown option */}
                </select>
              </div>

              {/* start and end time pickers side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[{ label: "Start Time", key: "start" }, { label: "End Time", key: "end" }].map(({ label, key }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type="time" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} // updates start or end time in form state
                      style={{ ...inputStyle, boxShadow: "0 1px 4px rgba(45,63,107,0.06)" }} />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <button onClick={handleSubmit} style={{ // submit button — calls handleSubmit when clicked
                  flex: 1, background: "linear-gradient(135deg, #1e2e52, #1a5fa8)",
                  color: "#fff", border: "none", borderRadius: 10, padding: "14px",
                  fontSize: 15, fontWeight: 700, fontFamily: "'Georgia', serif",
                  boxShadow: "0 2px 10px rgba(30,46,82,0.18)",
                }}>{editId ? "Update Hours" : "Post Hours"}</button>
                {editId && ( // only shows cancel button when editing
                  <button onClick={() => { setEditId(null); setForm({ name: "", class: "", day: "Monday", start: "", end: "", room: "" }); }} style={{ // clears edit mode and resets the form
                    background: "#f0f3f8", color: "#7a8aaa", border: "1.5px solid #d0d9e8",
                    borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'Georgia', serif",
                  }}>Cancel</button>
                )}
              </div>

              {saved && ( // shows success message after posting
                <div style={{
                  background: "rgba(41,182,232,0.10)", border: "1.5px solid rgba(41,182,232,0.35)",
                  borderRadius: 9, padding: "12px 16px", fontSize: 14, color: "#1a7abf", fontWeight: 700, textAlign: "center",
                }}>✓ Office hours posted successfully!</div>
              )}
            </div>

            {/* manage existing entries section — only shows if there are entries */}
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
                        <button onClick={() => handleEdit(entry)} style={{ // loads this entry into the form for editing
                          background: "#f0f3f8", color: "#7a8aaa", border: "1.5px solid #d0d9e8",
                          borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif",
                        }}>Edit</button>
                        <button onClick={() => handleDelete(entry.id)} style={{ // permanently removes this entry from the list
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

      {/* footer */}
      <div style={{ textAlign: "center", padding: "24px", borderTop: "1.5px solid #d0d9e8", fontSize: 12, color: "#b0bcd0", fontFamily: "'Georgia', serif" }}>
        Columbia Grammar & Preparatory School · Office Hours Portal
      </div>
    </div>
  );
}