import { useState, useMemo, useEffect } from "react";

const CATEGORIES = ["Electronics", "Clothing", "Food", "Tools", "Other"];
const UNITS = ["pcs", "meters", "kg", "liters"];

function getStatus(item) {
  if (item.qty === 0) return { cls: "out", label: "Out of stock" };
  if (item.qty <= item.low) return { cls: "low", label: "Low stock" };
  return { cls: "ok", label: "In stock" };
}

const emptyForm = { name: "", category: "Electronics", qty: 0, unit: "pcs", low: 5 };

const styles = {
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: "#0f0f0f",
    color: "#f0ede8",
    minHeight: "100vh",
    padding: "0",
  },
  header: {
    borderBottom: "1px solid #1e1e1e",
    padding: "1.5rem 2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0f0f0f",
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    boxSizing: "border-box",
  },
  logoWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  logoEyebrow: {
    fontSize: 10,
    letterSpacing: "0.25em",
    color: "#c8a96e",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  logoMain: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#f0ede8",
    textTransform: "uppercase",
    lineHeight: 1,
  },
  logoAccent: {
    color: "#c8a96e",
  },
  headerRight: {
    fontSize: 12,
    color: "#555",
    letterSpacing: "0.05em",
  },
  body: {
    padding: "2rem 2.5rem",
    maxWidth: "100%",
    margin: "0 auto",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 1,
    marginBottom: "2rem",
    border: "1px solid #1e1e1e",
    borderRadius: 12,
    overflow: "hidden",
    background: "#1e1e1e",
  },
  statCard: {
    background: "#141414",
    padding: "1.25rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#555",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  statVal: {
    fontSize: 28,
    fontWeight: 600,
    color: "#f0ede8",
    lineHeight: 1,
  },
  statAccent: {
    color: "#c8a96e",
  },
  toolbar: {
    display: "flex",
    gap: 10,
    marginBottom: "1.25rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    maxWidth: 260,
    padding: "9px 14px",
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    fontSize: 13,
    color: "#f0ede8",
    outline: "none",
  },
  selectInput: {
    padding: "9px 14px",
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    fontSize: 13,
    color: "#f0ede8",
    width: 160,
    outline: "none",
  },
  addBtn: {
    background: "#c8a96e",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#0f0f0f",
    letterSpacing: "0.04em",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "opacity 0.15s",
  },
  tableWrap: {
    border: "1px solid #1e1e1e",
    borderRadius: 12,
    overflow: "hidden",
    background: "#141414",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    tableLayout: "fixed",
  },
  th: {
    background: "#0f0f0f",
    padding: "11px 16px",
    textAlign: "left",
    fontWeight: 500,
    fontSize: 11,
    color: "#555",
    borderBottom: "1px solid #1e1e1e",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  td: {
    padding: "13px 16px",
    borderBottom: "1px solid #1a1a1a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#c8c4bc",
  },
  tdName: {
    color: "#f0ede8",
    fontWeight: 500,
  },
  badge: {
    display: "inline-block",
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 99,
    fontWeight: 600,
    letterSpacing: "0.04em",
  },
  badges: {
    ok:  { background: "#0e2a14", color: "#5db876", border: "1px solid #1a4a22" },
    low: { background: "#2a1f0a", color: "#c8a96e", border: "1px solid #4a3510" },
    out: { background: "#2a0e0e", color: "#e05c5c", border: "1px solid #4a1414" },
  },
  actionBtn: {
    background: "none",
    border: "1px solid #2a2a2a",
    cursor: "pointer",
    padding: "5px 8px",
    borderRadius: 6,
    color: "#555",
    fontSize: 13,
    marginRight: 4,
    transition: "all 0.15s",
  },
  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#141414",
    borderRadius: 14,
    border: "1px solid #2a2a2a",
    padding: "2rem",
    width: 360,
    maxWidth: "95vw",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: "1.5rem",
    color: "#f0ede8",
    letterSpacing: "0.04em",
  },
  fieldLabel: {
    display: "block",
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  fieldInput: {
    width: "100%",
    padding: "9px 12px",
    background: "#0f0f0f",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    fontSize: 13,
    color: "#f0ede8",
    outline: "none",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: "1.5rem",
  },
  cancelBtn: {
    background: "none",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 13,
    color: "#555",
  },
  saveBtn: {
    background: "#c8a96e",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#0f0f0f",
  },
  divider: {
    width: 32,
    height: 2,
    background: "#c8a96e",
    borderRadius: 2,
    marginBottom: "1.5rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    color: "#333",
    fontSize: 14,
  },
};

export default function InventoryManagement() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("crave_inventory_items");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [nextId, setNextId] = useState(() => {
    try {
      const saved = localStorage.getItem("crave_inventory_nextId");
      return saved ? JSON.parse(saved) : 1;
    } catch { return 1; }
  });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("crave_inventory_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("crave_inventory_nextId", JSON.stringify(nextId));
  }, [nextId]);

const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        (!q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) &&
        (!filterCat || i.category === filterCat)
    );
  }, [items, search, filterCat]);

  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter((i) => i.qty > i.low).length,
    lowStock: items.filter((i) => i.qty > 0 && i.qty <= i.low).length,
    outStock: items.filter((i) => i.qty === 0).length,
  }), [items]);

  function openAdd() { setEditId(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) { setEditId(item.id); setForm({ name: item.name, category: item.category, qty: item.qty, unit: item.unit, low: item.low }); setModal(true); }
  function closeModal() { setModal(false); }
  function setField(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  function handleSave() {
    if (!form.name.trim()) return;
    const obj = { id: editId ?? nextId, name: form.name.trim(), category: form.category, qty: parseInt(form.qty) || 0, unit: form.unit, low: parseInt(form.low) || 5 };
    if (editId !== null) { setItems((prev) => prev.map((i) => (i.id === editId ? obj : i))); }
    else { setItems((prev) => [...prev, obj]); setNextId((n) => n + 1); }
    closeModal();
  }

  function handleDelete(id) {
    if (window.confirm("Delete this item?")) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const colWidths = ["28%", "16%", "16%", "12%", "14%", "14%"];

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <span style={styles.logoEyebrow}>Stock Management</span>
          <span style={styles.logoMain}>
            <span style={styles.logoAccent}>C</span>RAVE
            <span style={{ color: "#2a2a2a", margin: "0 8px" }}>—</span>
            INVENTORY
          </span>
        </div>
        <span style={styles.headerRight}>{new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
      </header>

      <div style={styles.body}>
        {/* Gold divider */}
        <div style={styles.divider} />

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: "Total Items", val: stats.total, accent: false },
            { label: "In Stock", val: stats.inStock, accent: false },
            { label: "Low Stock", val: stats.lowStock, accent: true },
            { label: "Out of Stock", val: stats.outStock, accent: true },
          ].map(({ label, val, accent }) => (
            <div key={label} style={styles.statCard}>
              <div style={styles.statLabel}>{label}</div>
              <div style={{ ...styles.statVal, ...(accent && val > 0 ? styles.statAccent : {}) }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={styles.selectInput}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={openAdd} style={styles.addBtn}>+ Add Item</button>
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "Category", "Quantity", "Low At", "Status", "Actions"].map((h, i) => (
                  <th key={h} style={{ ...styles.th, width: colWidths[i], textAlign: i >= 2 && i <= 3 ? "right" : i === 5 ? "center" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...styles.td, ...styles.emptyState }}>
                    {items.length === 0
                      ? "No items yet — click + Add Item to get started"
                      : "No items match your search"}
                  </td>
                </tr>
              ) : filtered.map((item) => {
                const { cls, label } = getStatus(item);
                return (
                  <tr key={item.id}>
                    <td style={{ ...styles.td, ...styles.tdName, width: colWidths[0] }} title={item.name}>{item.name}</td>
                    <td style={{ ...styles.td, width: colWidths[1] }}>{item.category}</td>
                    <td style={{ ...styles.td, width: colWidths[2], textAlign: "right" }}>{item.qty} <span style={{ color: "#333" }}>{item.unit}</span></td>
                    <td style={{ ...styles.td, width: colWidths[3], textAlign: "right" }}>{item.low} <span style={{ color: "#333" }}>{item.unit}</span></td>
                    <td style={{ ...styles.td, width: colWidths[4] }}>
                      <span style={{ ...styles.badge, ...styles.badges[cls] }}>{label}</span>
                    </td>
                    <td style={{ ...styles.td, width: colWidths[5], textAlign: "center" }}>
                      <button onClick={() => openEdit(item)} title="Edit" style={styles.actionBtn}>✏️</button>
                      <button onClick={() => handleDelete(item.id)} title="Delete" style={styles.actionBtn}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div style={{ marginTop: "1rem", fontSize: 12, color: "#333", textAlign: "right", letterSpacing: "0.05em" }}>
          {filtered.length} of {items.length} items
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }} style={styles.modalBg}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>{editId !== null ? "Edit Item" : "New Item"}</div>

            {[
              { label: "Name", input: <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Item name" style={styles.fieldInput} /> },
              { label: "Category", input: (
                <select value={form.category} onChange={(e) => setField("category", e.target.value)} style={styles.fieldInput}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              )},
              { label: "Quantity", input: (
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" min="0" value={form.qty} onChange={(e) => setField("qty", e.target.value)} style={{ ...styles.fieldInput, width: "auto", flex: 1 }} />
                  <select value={form.unit} onChange={(e) => setField("unit", e.target.value)} style={{ ...styles.fieldInput, width: 100 }}>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              )},
              { label: "Low Stock Threshold", input: <input type="number" min="0" value={form.low} onChange={(e) => setField("low", e.target.value)} style={styles.fieldInput} /> },
            ].map(({ label, input }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={styles.fieldLabel}>{label}</label>
                {input}
              </div>
            ))}

            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} style={styles.saveBtn}>Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}