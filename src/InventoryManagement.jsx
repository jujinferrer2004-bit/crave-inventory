import { useState, useMemo, useEffect } from "react";
import { useAuth } from "./AuthContext";
import CraveTechLogo from "./assets/CRAVE CORP HIGH QUALITY LOGO.png";
import CraveAdsLogo from "./assets/CRAVE ADS LOGO SUPER HD.png";
import CraveTech08 from "./assets/Cravetech-08.png";

const CATEGORIES = ["Electronics", "Clothing", "Food", "Tools", "Other"];
const UNITS = ["pcs", "meters", "kg", "liters"];

function getStatus(item) {
  if (item.qty === 0) return { cls: "out", label: "Out of stock" };
  if (item.qty <= item.low) return { cls: "low", label: "Low stock" };
  return { cls: "ok", label: "In stock" };
}

const emptyForm = { name: "", category: "Electronics", qty: 0, unit: "pcs", low: 5 };

const getStyles = (isDark) => ({
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: isDark ? "#0f0f0f" : "#f5f3ef",
    color: isDark ? "#f0ede8" : "#1a1a1a",
    minHeight: "100vh",
    padding: "0",
  },
  logoWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  logoEyebrow: {
    fontSize: 10,
    letterSpacing: "0.25em",
    color: "#c0392b",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  logoMain: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: isDark ? "#f0ede8" : "#1a1a1a",
    textTransform: "uppercase",
    lineHeight: 1,
  },
  logoAccent: {
    color: "#c0392b",
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
  
  statVal: {
    fontSize: 28,
    fontWeight: 600,
    color: "#f0ede8",
    lineHeight: 1,
  },
  statAccent: {
    color: "#c0392b",
  },
  toolbar: {
    display: "flex",
    gap: 10,
    marginBottom: "1.25rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  
  addBtn: {
    background: "#c0392b",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: "0.04em",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "opacity 0.15s",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    tableLayout: "fixed",
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
    low: { background: "#2a1010", color: "#e07070", border: "1px solid #5a1a1a" },
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
  modalActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: "1.5rem",
  },
  saveBtn: {
    background: "#c0392b",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#ffffff",
  },
  divider: {
    width: 32,
    height: 2,
    background: "#c0392b",
    borderRadius: 2,
    marginBottom: "1.5rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    color: isDark ? "#333" : "#aaa",
    fontSize: 14,
  },
  header: {
    borderBottom: `1px solid ${isDark ? "#1e1e1e" : "#e0ddd8"}`,
    padding: "1.5rem 2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: isDark ? "#0f0f0f" : "#f5f3ef",
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    boxSizing: "border-box",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 1,
    marginBottom: "2rem",
    border: `1px solid ${isDark ? "#1e1e1e" : "#e0ddd8"}`,
    borderRadius: 12,
    overflow: "hidden",
    background: isDark ? "#1e1e1e" : "#e0ddd8",
  },
  statCard: {
    background: isDark ? "#141414" : "#ffffff",
    padding: "1.25rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    color: isDark ? "#555" : "#999",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    maxWidth: 260,
    padding: "9px 14px",
    background: isDark ? "#141414" : "#ffffff",
    border: `1px solid ${isDark ? "#2a2a2a" : "#d0cdc8"}`,
    borderRadius: 8,
    fontSize: 13,
    color: isDark ? "#f0ede8" : "#1a1a1a",
    outline: "none",
  },
  selectInput: {
    padding: "9px 14px",
    background: isDark ? "#141414" : "#ffffff",
    border: `1px solid ${isDark ? "#2a2a2a" : "#d0cdc8"}`,
    borderRadius: 8,
    fontSize: 13,
    color: isDark ? "#f0ede8" : "#1a1a1a",
    width: 160,
    outline: "none",
  },
  tableWrap: {
    border: `1px solid ${isDark ? "#1e1e1e" : "#e0ddd8"}`,
    borderRadius: 12,
    overflow: "hidden",
    background: isDark ? "#141414" : "#ffffff",
  },
  th: {
    background: isDark ? "#0f0f0f" : "#f5f3ef",
    padding: "11px 16px",
    textAlign: "left",
    fontWeight: 500,
    fontSize: 11,
    color: isDark ? "#555" : "#999",
    borderBottom: `1px solid ${isDark ? "#1e1e1e" : "#e0ddd8"}`,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  td: {
    padding: "13px 16px",
    borderBottom: `1px solid ${isDark ? "#1a1a1a" : "#f0ede8"}`,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: isDark ? "#c8c4bc" : "#555",
  },
  tdName: {
    color: isDark ? "#f0ede8" : "#1a1a1a",
    fontWeight: 500,
  },
  modal: {
    background: isDark ? "#141414" : "#ffffff",
    borderRadius: 14,
    border: `1px solid ${isDark ? "#2a2a2a" : "#d0cdc8"}`,
    padding: "2rem",
    width: 360,
    maxWidth: "95vw",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: "1.5rem",
    color: isDark ? "#f0ede8" : "#1a1a1a",
    letterSpacing: "0.04em",
  },
  fieldLabel: {
    display: "block",
    fontSize: 11,
    color: isDark ? "#555" : "#999",
    marginBottom: 6,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  fieldInput: {
    width: "100%",
    padding: "9px 12px",
    background: isDark ? "#0f0f0f" : "#f5f3ef",
    border: `1px solid ${isDark ? "#2a2a2a" : "#d0cdc8"}`,
    borderRadius: 8,
    fontSize: 13,
    color: isDark ? "#f0ede8" : "#1a1a1a",
    outline: "none",
    boxSizing: "border-box",
  },
  cancelBtn: {
    background: "none",
    border: `1px solid ${isDark ? "#2a2a2a" : "#d0cdc8"}`,
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 13,
    color: isDark ? "#555" : "#999",
  },
});

export default function InventoryManagement() {
  const { role, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("crave_theme") || "dark");
  const isDark = theme === "dark";
  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("crave_theme", next);
  }
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const saved = localStorage.getItem("crave_inventory_log");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [itemHistory, setItemHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("crave_inventory_history");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [historyModal, setHistoryModal] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);

  function logActivity(action, detail, itemId = null) {
    const entry = { id: Date.now(), timestamp: new Date().toISOString(), role, action, detail };
    setActivityLog((prev) => [entry, ...prev]);
    if (itemId !== null) {
      setItemHistory((prev) => ({
        ...prev,
        [itemId]: [entry, ...(prev[itemId] || [])],
      }));
    }
  }

  function openHistoryModal(item) {
    setHistoryTarget(item);
    setHistoryModal(true);
  }
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("crave_inventory_requests");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("crave_inventory_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
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

  useEffect(() => {
    localStorage.setItem("crave_inventory_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("crave_inventory_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("crave_inventory_log", JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem("crave_inventory_history", JSON.stringify(itemHistory));
  }, [itemHistory]);

  function submitRequest(type, payload) {
    const req = { id: Date.now(), type, payload, status: "pending" };
    setRequests((prev) => [...prev, req]);
  }

  function approveRequest(reqId) {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    if (req.type === "add") {
      const obj = { ...req.payload, id: nextId };
      setItems((prev) => [...prev, obj]);
      setNextId((n) => n + 1);
    } else if (req.type === "stock_in") {
      setItems((prev) => prev.map((i) => i.id === req.payload.itemId ? { ...i, qty: i.qty + req.payload.qty } : i));
    } else if (req.type === "stock_out") {
      setItems((prev) => prev.map((i) => i.id === req.payload.itemId ? { ...i, qty: Math.max(0, i.qty - req.payload.qty) } : i));
    }
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: "approved" } : r));
    setNotifications((prev) => [...prev, { id: Date.now(), message: `Your "${req.type}" request for "${req.payload.name ?? req.payload.itemName}" was approved.`, read: false }]);
    logActivity("Approve Request", `Approved "${req.type}" request for "${req.payload.name ?? req.payload.itemName}"`, req.payload.itemId ?? null);
  }

  function openDeclineModal(reqId) {
    setDeclineTarget(reqId);
    setDeclineReason("");
    setDeclineModal(true);
  }

  function confirmDecline() {
    const reqId = declineTarget;
    const req = requests.find((r) => r.id === reqId);
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: "declined", declineReason } : r));
    if (req) {
      setNotifications((prev) => [...prev, { id: Date.now(), message: `Your "${req.type}" request for "${req.payload.name ?? req.payload.itemName}" was declined${declineReason ? `: "${declineReason}"` : "."}`, read: false }]);
      logActivity("Decline Request", `Declined "${req.type}" request for "${req.payload.name ?? req.payload.itemName}"${declineReason ? ` — Reason: "${declineReason}"` : ""}`);
    }
    setDeclineModal(false);
    setDeclineTarget(null);
    setDeclineReason("");
  }

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

  const unreadCount = notifications.filter((n) => !n.read).length;
  function dismissNotifications() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const [stockModal, setStockModal] = useState(false);
  const [stockType, setStockType] = useState("stock_in");
  const [stockTarget, setStockTarget] = useState(null);
  const [stockQty, setStockQty] = useState(1);
  const [declineModal, setDeclineModal] = useState(false);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  function openAdd() { setEditId(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) { setEditId(item.id); setForm({ name: item.name, category: item.category, qty: item.qty, unit: item.unit, low: item.low }); setModal(true); }
  function closeModal() { setModal(false); }
  function setField(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  function handleSave() {
    if (!form.name.trim()) return;
    const payload = { name: form.name.trim(), category: form.category, qty: parseInt(form.qty) || 0, unit: form.unit, low: parseInt(form.low) || 5 };
    if (role === "manager") {
      const obj = { ...payload, id: editId ?? nextId };
      if (editId !== null) {
        setItems((prev) => prev.map((i) => (i.id === editId ? obj : i)));
        logActivity("Edit Item", `Edited "${payload.name}" — qty: ${payload.qty} ${payload.unit}, category: ${payload.category}`, editId);
      } else {
        const newId = nextId;
        setItems((prev) => [...prev, obj]);
        setNextId((n) => n + 1);
        logActivity("Add Item", `Added "${payload.name}" — qty: ${payload.qty} ${payload.unit}, category: ${payload.category}`, newId);
      }
    } else {
      submitRequest("add", payload);
      alert("Request submitted! Waiting for manager approval.");
    }
    closeModal();
  }

  function handleDelete(id) {
    if (role !== "manager") return;
    if (window.confirm("Delete this item?")) {
      const item = items.find((i) => i.id === id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (item) logActivity("Delete Item", `Deleted "${item.name}" (${item.category}) — last qty: ${item.qty} ${item.unit}`, id);
    }
  }

  function openStockModal(item, type) {
    setStockTarget(item);
    setStockType(type);
    setStockQty(1);
    setStockModal(true);
  }

  function handleStockSubmit() {
    if (!stockTarget || stockQty < 1) return;
    const qty = parseInt(stockQty) || 1;
    if (role === "manager") {
      if (stockType === "stock_in") {
        setItems((prev) => prev.map((i) => i.id === stockTarget.id ? { ...i, qty: i.qty + qty } : i));
        logActivity("Stock In", `Added ${qty} ${stockTarget.unit} to "${stockTarget.name}"`, stockTarget.id);
      } else {
        setItems((prev) => prev.map((i) => i.id === stockTarget.id ? { ...i, qty: Math.max(0, i.qty - qty) } : i));
        logActivity("Stock Out", `Removed ${qty} ${stockTarget.unit} from "${stockTarget.name}"`, stockTarget.id);
      }
    } else {
      submitRequest(stockType, { itemId: stockTarget.id, itemName: stockTarget.name, qty });
      alert("Request submitted! Waiting for manager approval.");
    }
    setStockModal(false);
  }

  const styles = getStyles(isDark);
  const colWidths = ["24%", "14%", "14%", "10%", "12%", "26%"];
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={CraveTechLogo} alt="CraveTech" style={{ height: 56, objectFit: "contain" }} />
          <img src={CraveAdsLogo} alt="Crave Ads" style={{ height: 48, objectFit: "contain" }} />
          <img src={CraveTech08} alt="Cravetech 08" style={{ height: 48, objectFit: "contain" }} />
          <div style={{ width: 1, height: 36, background: isDark ? "#2a2a2a" : "#d0cdc8", margin: "0 4px" }} />
          <div style={styles.logoWrap}>
            <span style={styles.logoEyebrow}>Stock Management</span>
            <span style={styles.logoMain}>
              <span style={styles.logoAccent}>CRAVE</span> INVENTORY
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={styles.headerRight}>{new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
          <button onClick={toggleTheme} title="Toggle theme" style={{ background: "none", border: `1px solid ${isDark ? "#2a2a2a" : "#d0cdc8"}`, borderRadius: 6, padding: "5px 12px", color: isDark ? "#555" : "#999", fontSize: 13, cursor: "pointer" }}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span style={{ fontSize: 12, color: "#c0392b", letterSpacing: "0.05em", textTransform: "uppercase" }}>{role}</span>
          {role === "member" && unreadCount > 0 && (
            <button onClick={dismissNotifications} title="Mark all as read" style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 6, padding: "5px 12px", color: "#f0ede8", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              🔔
              <span style={{ background: "#c0392b", color: "#ffffff", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>{unreadCount}</span>
            </button>
          )}
          <button onClick={logout} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 6, padding: "5px 12px", color: "#555", fontSize: 12, cursor: "pointer" }}>Logout</button>
        </div>
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
          <button onClick={openAdd} style={styles.addBtn}>+ {role === "manager" ? "Add Item" : "Request Item"}</button>
          {role === "manager" && pendingCount > 0 && (
            <span style={{ background: "#c0392b", color: "#ffffff", borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
              {pendingCount} pending
            </span>
          )}
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
                      <button onClick={() => openStockModal(item, "stock_in")} title="Stock In" style={{ ...styles.actionBtn, color: "#5db876" }}>＋ In</button>
                      <button onClick={() => openStockModal(item, "stock_out")} title="Stock Out" style={{ ...styles.actionBtn, color: "#e05c5c" }}>－ Out</button>
                      {role === "manager" && <button onClick={() => openEdit(item)} title="Edit" style={styles.actionBtn}>✏️</button>}
                      {role === "manager" && <button onClick={() => handleDelete(item.id)} title="Delete" style={styles.actionBtn}>🗑️</button>}
                      {role === "manager" && <button onClick={() => openHistoryModal(item)} title="History" style={styles.actionBtn}>🕓</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notifications — Member Only */}
        {role === "member" && notifications.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 500 }}>Notifications</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...notifications].reverse().map((n) => (
                <div key={n.id} style={{ background: n.read ? "#141414" : "#1a1500", border: `1px solid ${n.read ? "#2a2a2a" : "#4a3510"}`, borderRadius: 10, padding: "0.85rem 1.25rem", fontSize: 13, color: n.read ? "#555" : "#f0ede8", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span>{n.read ? "✓" : "🔔"} {n.message}</span>
                  {!n.read && <button onClick={dismissNotifications} style={{ background: "none", border: "none", color: "#555", fontSize: 11, cursor: "pointer" }}>Dismiss all</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer count */}
        <div style={{ marginTop: "1rem", fontSize: 12, color: "#333", textAlign: "right", letterSpacing: "0.05em" }}>
          {filtered.length} of {items.length} items
        </div>
      </div>

      {/* Stock Modal */}
      {stockModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setStockModal(false); }} style={styles.modalBg}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>{stockType === "stock_in" ? "Stock In" : "Stock Out"} — {stockTarget?.name}</div>
            <label style={styles.fieldLabel}>Quantity</label>
            <input type="number" min="1" value={stockQty} onChange={(e) => setStockQty(e.target.value)} style={styles.fieldInput} />
            {role === "member" && <p style={{ fontSize: 12, color: "#555", marginTop: 8 }}>This will be sent to the manager for approval.</p>}
            <div style={styles.modalActions}>
              <button onClick={() => setStockModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleStockSubmit} style={styles.saveBtn}>{role === "manager" ? "Confirm" : "Submit Request"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Panel — Manager Only */}
      {role === "manager" && requests.filter(r => r.status === "pending").length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 500 }}>Pending Requests</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {requests.filter(r => r.status === "pending").map(req => (
              <div key={req.id} style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: "#c0392b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    {req.type === "add" ? "New Item" : req.type === "stock_in" ? "Stock In" : "Stock Out"}
                  </span>
                  <div style={{ fontSize: 13, color: "#f0ede8", marginTop: 4 }}>
                    {req.type === "add"
                      ? `${req.payload.name} — ${req.payload.qty} ${req.payload.unit} (${req.payload.category})`
                      : `${req.payload.itemName} — ${req.payload.qty} units`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => approveRequest(req.id)} style={{ background: "#0e2a14", border: "1px solid #1a4a22", color: "#5db876", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                  <button onClick={() => openDeclineModal(req.id)} style={{ background: "#2a0e0e", border: "1px solid #4a1414", color: "#e05c5c", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item History Modal */}
      {historyModal && historyTarget && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setHistoryModal(false); }} style={styles.modalBg}>
          <div style={{ ...styles.modal, width: 460, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={styles.modalTitle}>🕓 History — {historyTarget.name}</div>
              <button onClick={() => setHistoryModal(false)} style={{ background: "none", border: "none", color: isDark ? "#555" : "#999", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {(itemHistory[historyTarget.id] || []).length === 0 ? (
                <div style={{ textAlign: "center", color: isDark ? "#333" : "#bbb", fontSize: 13, padding: "2rem" }}>No history yet for this item.</div>
              ) : (itemHistory[historyTarget.id] || []).map((entry, i) => (
                <div key={entry.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#c0392b", marginTop: 3, flexShrink: 0 }} />
                    {i < (itemHistory[historyTarget.id] || []).length - 1 && (
                      <div style={{ width: 2, flex: 1, background: isDark ? "#2a2a2a" : "#e0ddd8", minHeight: 24 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#c0392b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{entry.action}</div>
                    <div style={{ fontSize: 13, color: isDark ? "#f0ede8" : "#1a1a1a", marginTop: 2 }}>{entry.detail}</div>
                    <div style={{ fontSize: 11, color: isDark ? "#444" : "#bbb", marginTop: 3 }}>
                      {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · by {entry.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeclineModal(false); }} style={styles.modalBg}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>Decline Request</div>
            <label style={styles.fieldLabel}>Reason (optional)</label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Out of budget, duplicate request..."
              style={{ ...styles.fieldInput, height: 90, resize: "vertical", fontFamily: "inherit" }}
            />
            <div style={styles.modalActions}>
              <button onClick={() => setDeclineModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmDecline} style={{ ...styles.saveBtn, background: "#e05c5c" }}>Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log — Manager Only */}
      {role === "manager" && activityLog.length > 0 && (
        <div style={{ marginTop: "2rem", padding: "0 2.5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ fontSize: 11, color: isDark ? "#555" : "#999", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>Activity Log</div>
            <button onClick={() => { setActivityLog([]); localStorage.removeItem("crave_inventory_log"); }} style={{ background: "none", border: `1px solid ${isDark ? "#2a2a2a" : "#d0cdc8"}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: isDark ? "#555" : "#999", cursor: "pointer" }}>Clear Log</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {activityLog.map((entry) => (
              <div key={entry.id} style={{ background: isDark ? "#141414" : "#ffffff", border: `1px solid ${isDark ? "#1e1e1e" : "#e0ddd8"}`, borderRadius: 10, padding: "0.75rem 1.25rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 11, color: "#c0392b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{entry.action}</span>
                  <span style={{ fontSize: 13, color: isDark ? "#f0ede8" : "#1a1a1a" }}>{entry.detail}</span>
                  <span style={{ fontSize: 11, color: isDark ? "#444" : "#bbb" }}>by {entry.role}</span>
                </div>
                <div style={{ fontSize: 11, color: isDark ? "#444" : "#bbb", whiteSpace: "nowrap", textAlign: "right" }}>
                  <div>{new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div>{new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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