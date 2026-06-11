import { useState, useMemo, useEffect } from "react";
import { useAuth } from "./AuthContext";
import "./styles.css";
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

  const colWidths = ["24%", "14%", "14%", "10%", "12%", "26%"];
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const [logFilterAction, setLogFilterAction] = useState("All");
  const [logFilterDate, setLogFilterDate] = useState("All");
  const [logSort, setLogSort] = useState("Newest");

  const filteredLog = useMemo(() => {
    const now = new Date();
    return [...activityLog]
      .filter((entry) => {
        if (logFilterAction !== "All" && entry.action !== logFilterAction) return false;
        if (logFilterDate === "Today") {
          const d = new Date(entry.timestamp);
          return d.toDateString() === now.toDateString();
        }
        if (logFilterDate === "This Week") {
          const d = new Date(entry.timestamp);
          const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
          return d >= weekAgo;
        }
        if (logFilterDate === "This Month") {
          const d = new Date(entry.timestamp);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      })
      .sort((a, b) => logSort === "Newest"
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
      );
  }, [activityLog, logFilterAction, logFilterDate, logSort]);

  return (
    <div className="root" data-theme={theme}>
      {/* Header */}
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={CraveTechLogo} alt="CraveTech" style={{ height: 56, objectFit: "contain" }} />
          <img src={CraveAdsLogo} alt="Crave Ads" style={{ height: 48, objectFit: "contain" }} />
          <img src={CraveTech08} alt="Cravetech 08" style={{ height: 48, objectFit: "contain" }} />
          <div className="divider-line" />
          <div className="logo-wrap">
            <span className="logo-eyebrow">Stock Management</span>
            <span className="logo-main">
              <span className="logo-accent">CRAVE</span> INVENTORY
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="header-right">{new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
          <button onClick={toggleTheme} title="Toggle theme" className="theme-toggle-btn">
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span className="role-badge">{role}</span>
          {role === "member" && unreadCount > 0 && (
            <button onClick={dismissNotifications} title="Mark all as read" className="notif-btn">
              🔔
              <span className="notif-count">{unreadCount}</span>
            </button>
          )}
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="body">
        {/* Gold divider */}
        <div className="divider" />

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: "Total Items", val: stats.total, accent: false },
            { label: "In Stock", val: stats.inStock, accent: false },
            { label: "Low Stock", val: stats.lowStock, accent: true },
            { label: "Out of Stock", val: stats.outStock, accent: true },
          ].map(({ label, val, accent }) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className={`stat-val ${accent && val > 0 ? "stat-accent" : ""}`}>{val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="select-input">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={openAdd} className="add-btn">+ {role === "manager" ? "Add Item" : "Request Item"}</button>
          {role === "manager" && pendingCount > 0 && (
            <span className="pending-badge">
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {["Name", "Category", "Quantity", "Low At", "Status", "Actions"].map((h, i) => (
                  <th key={h} className="th" style={{ width: colWidths[i], textAlign: "center"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="td empty-state">
                    {items.length === 0
                      ? "No items yet — click + Add Item to get started"
                      : "No items match your search"}
                  </td>
                </tr>
              ) : filtered.map((item) => {
                const { cls, label } = getStatus(item);
                return (
                  <tr key={item.id}>
                    <td className="td td-name" style={{ width: colWidths[0], textAlign: "center" }} title={item.name}>{item.name}</td>
                    <td className="td" style={{ width: colWidths[1], textAlign: "center" }}>{item.category}</td>
                    <td className="td" style={{ width: colWidths[2], textAlign: "center" }}>{item.qty} <span style={{ color: "#333" }}>{item.unit}</span></td>
                    <td className="td" style={{ width: colWidths[3], textAlign: "center" }}>{item.low} <span style={{ color: "#333" }}>{item.unit}</span></td>
                    <td className="td" style={{ width: colWidths[4], textAlign: "left" }}>
                      <span className={`badge badge-${cls}`}>{label}</span>
                    </td>
                    <td className="td" style={{ width: colWidths[5], textAlign: "center" }}>
                      <button onClick={() => openStockModal(item, "stock_in")} title="Stock In" className="action-btn" style={{ color: "#5db876" }}>＋ In</button>
                      <button onClick={() => openStockModal(item, "stock_out")} title="Stock Out" className="action-btn" style={{ color: "#e05c5c" }}>－ Out</button>
                      {role === "manager" && <button onClick={() => openEdit(item)} title="Edit" className="action-btn">✏️</button>}
                      {role === "manager" && <button onClick={() => handleDelete(item.id)} title="Delete" className="action-btn">🗑️</button>}
                      {role === "manager" && <button onClick={() => openHistoryModal(item)} title="History" className="action-btn">🕓</button>}
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
            <div className="section-label">Notifications</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...notifications].reverse().map((n) => (
                <div key={n.id} className={`notif-item ${n.read ? "notif-item-read" : "notif-item-unread"}`}>
                  <span>{n.read ? "✓" : "🔔"} {n.message}</span>
                  {!n.read && <button onClick={dismissNotifications} className="dismiss-btn">Dismiss all</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer count */}
        <div className="footer-count">
          {filtered.length} of {items.length} items
        </div>
      </div>

      {/* Stock Modal */}
      {stockModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setStockModal(false); }} className="modal-bg">
          <div className="modal">
            <div className="modal-title">{stockType === "stock_in" ? "Stock In" : "Stock Out"} — {stockTarget?.name}</div>
            <label className="field-label">Quantity</label>
            <input type="number" min="1" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="field-input" />
            {role === "member" && <p style={{ fontSize: 12, color: "#555", marginTop: 8 }}>This will be sent to the manager for approval.</p>}
            <div className="modal-actions">
              <button onClick={() => setStockModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleStockSubmit} className="save-btn">{role === "manager" ? "Confirm" : "Submit Request"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Panel — Manager Only */}
      {role === "manager" && requests.filter(r => r.status === "pending").length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div className="section-label">Pending Requests</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {requests.filter(r => r.status === "pending").map(req => (
              <div key={req.id} className="pending-row">
                <div>
                  <span className="pending-type">
                    {req.type === "add" ? "New Item" : req.type === "stock_in" ? "Stock In" : "Stock Out"}
                  </span>
                  <div className="pending-detail">
                    {req.type === "add"
                      ? `${req.payload.name} — ${req.payload.qty} ${req.payload.unit} (${req.payload.category})`
                      : `${req.payload.itemName} — ${req.payload.qty} units`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => approveRequest(req.id)} className="approve-btn">Approve</button>
                  <button onClick={() => openDeclineModal(req.id)} className="decline-btn">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item History Modal */}
      {historyModal && historyTarget && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setHistoryModal(false); }} className="modal-bg">
          <div className="modal modal-large">
            <div className="modal-header-row">
              <div className="modal-title">🕓 History — {historyTarget.name}</div>
              <button onClick={() => setHistoryModal(false)} className="modal-close-btn">✕</button>
            </div>
            <div className="history-list">
              {(itemHistory[historyTarget.id] || []).length === 0 ? (
                <div className="history-empty">No history yet for this item.</div>
              ) : (itemHistory[historyTarget.id] || []).map((entry, i) => (
                <div key={entry.id} className="history-entry">
                  <div className="history-timeline">
                    <div className="history-dot" />
                    {i < (itemHistory[historyTarget.id] || []).length - 1 && (
                      <div className="history-line" />
                    )}
                  </div>
                  <div className="history-content">
                    <div className="history-action">{entry.action}</div>
                    <div className="history-detail">{entry.detail}</div>
                    <div className="history-meta">
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
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeclineModal(false); }} className="modal-bg">
          <div className="modal">
            <div className="modal-title">Decline Request</div>
            <label className="field-label">Reason (optional)</label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Out of budget, duplicate request..."
              className="field-input textarea-field"
            />
            <div className="modal-actions">
              <button onClick={() => setDeclineModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={confirmDecline} className="save-btn" style={{ background: "#e05c5c" }}>Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log — Manager Only */}
      {role === "manager" && activityLog.length > 0 && (
        <div className="activity-log-wrap">
          <div className="activity-log-header">
            <div className="section-label" style={{ marginBottom: 0 }}>Activity Log</div>
            <button onClick={() => { setActivityLog([]); localStorage.removeItem("crave_inventory_log"); }} className="clear-log-btn">Clear Log</button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
            <select value={logFilterAction} onChange={(e) => setLogFilterAction(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
              {["All", "Add Item", "Edit Item", "Delete Item", "Stock In", "Stock Out", "Approve Request", "Decline Request"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select value={logFilterDate} onChange={(e) => setLogFilterDate(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
              {["All", "Today", "This Week", "This Month"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select value={logSort} onChange={(e) => setLogSort(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
            <span style={{ fontSize: 12, alignSelf: "center", color: "#888" }}>
              {filteredLog.length} {filteredLog.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredLog.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", fontSize: 13, color: "#888" }}>No entries match your filters.</div>
            ) : filteredLog.map((entry) => (
              <div key={entry.id} className="activity-entry">
                <div className="activity-entry-left">
                  <span className="activity-entry-action">{entry.action}</span>
                  <span className="activity-entry-detail">{entry.detail}</span>
                  <span className="activity-entry-role">by {entry.role}</span>
                </div>
                <div className="activity-entry-time">
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
        <div onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }} className="modal-bg">
          <div className="modal">
            <div className="modal-title">{editId !== null ? "Edit Item" : "New Item"}</div>

            {[
              { label: "Name", input: <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Item name" className="field-input" /> },
              { label: "Category", input: (
                <select value={form.category} onChange={(e) => setField("category", e.target.value)} className="field-input">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              )},
              { label: "Quantity", input: (
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" min="0" value={form.qty} onChange={(e) => setField("qty", e.target.value)} className="field-input" style={{ width: "auto", flex: 1 }} />
                  <select value={form.unit} onChange={(e) => setField("unit", e.target.value)} className="field-input" style={{ width: 100 }}>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              )},
              { label: "Low Stock Threshold", input: <input type="number" min="0" value={form.low} onChange={(e) => setField("low", e.target.value)} className="field-input" /> },
            ].map(({ label, input }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label className="field-label">{label}</label>
                {input}
              </div>
            ))}

            <div className="modal-actions">
              <button onClick={closeModal} className="cancel-btn">Cancel</button>
              <button onClick={handleSave} className="save-btn">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}