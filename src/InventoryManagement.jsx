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

function generateSKU(id) {
  return `SKU-${String(id).padStart(5, "0")}`;
}

function generateCartId() {
  const now = new Date();
  const stamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CART-${stamp}-${rand}`;
}

const emptyForm = { name: "", category: "Electronics", qty: 0, unit: "pcs", low: 5 };

// ─── Stock Picker Panel ────────────────────────────────────────────────────────
function StockPickerPanel({ items, type, onAddToCart, onClose }) {
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");

  function setQty(id, val) {
    const n = Math.max(0, parseInt(val) || 0);
    setQuantities((prev) => ({ ...prev, [id]: n }));
  }

  function increment(id) {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function decrement(id) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  }

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      generateSKU(i.id).toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = Object.values(quantities).filter((q) => q > 0).length;

  function handleAddToCart() {
    const cartItems = items
      .filter((i) => (quantities[i.id] || 0) > 0)
      .map((i) => ({ itemId: i.id, itemName: i.name, sku: generateSKU(i.id), qty: quantities[i.id], unit: i.unit }));
    if (cartItems.length === 0) return;

    if (type === "stock_out") {
      const overStock = cartItems.filter((ci) => {
        const item = items.find((i) => i.id === ci.itemId);
        return item && ci.qty > item.qty;
      });
      if (overStock.length > 0) {
        const names = overStock.map((ci) => {
          const item = items.find((i) => i.id === ci.itemId);
          return `• ${ci.itemName}: requested ${ci.qty}, available ${item.qty}`;
        }).join("\n");
        alert(`Cannot stock out — quantity exceeds available stock:\n\n${names}`);
        return;
      }
    }

    onAddToCart(cartItems);
  }

  const isIn = type === "stock_in";

  return (
    <div className="picker-panel">
      <div className="picker-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className={`picker-type-badge ${isIn ? "badge-type-in" : "badge-type-out"}`}>
            {isIn ? "▼ Stock In" : "▲ Stock Out"}
          </span>
          <span className="picker-subtitle">Select items and quantities</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {selectedCount > 0 && (
            <span className="picker-selected-count">{selectedCount} item{selectedCount > 1 ? "s" : ""} selected</span>
          )}
          <button
            onClick={handleAddToCart}
            className={`save-btn ${selectedCount === 0 ? "btn-disabled" : ""}`}
            disabled={selectedCount === 0}
          >
            🛒 Add to Cart
          </button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          style={{ width: "100%", maxWidth: 320 }}
        />
      </div>

      <div style={{ maxHeight: 400, overflowY: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
        <table className="table" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th className="th" style={{ width: "12%", textAlign: "center" }}>SKU</th>
              <th className="th" style={{ width: "24%", textAlign: "center" }}>NAME</th>
              <th className="th" style={{ width: "13%", textAlign: "center" }}>CATEGORY</th>
              <th className="th" style={{ width: "13%", textAlign: "center" }}>AVAILABLE</th>
              <th className="th" style={{ width: "10%", textAlign: "center" }}>STATUS</th>
              <th className="th" style={{ width: "28%", textAlign: "center" }}>QTY TO ADD</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const qty = quantities[item.id] || 0;
              const { cls, label } = getStatus(item);
              return (
                <tr key={item.id} style={{ background: qty > 0 ? "rgba(192,57,43,0.04)" : "transparent" }}>
                  <td className="td td-sku" style={{ textAlign: "center" }}>{generateSKU(item.id)}</td>
                  <td className="td td-name" style={{ textAlign: "center" }} title={item.name}>{item.name}</td>
                  <td className="td" style={{ textAlign: "center" }}>{item.category}</td>
                  <td className="td" style={{ textAlign: "center" }}>{item.qty} <span style={{ color: "#888", fontSize: 12 }}>{item.unit}</span></td>
                  <td className="td" style={{ textAlign: "center" }}>
                    <span className={`badge badge-${cls}`}>{label}</span>
                  </td>
                  <td className="td" style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => decrement(item.id)} className="qty-btn qty-minus">−</button>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => setQty(item.id, e.target.value)}
                        className="qty-display"
                        style={{ borderColor: type === "stock_out" && qty > item.qty ? "#e05c5c" : undefined }}
                      />
                      <button onClick={() => increment(item.id)} className="qty-btn qty-plus">+</button>
                      <span className="qty-unit">{item.unit}</span>
                      {type === "stock_out" && qty > item.qty && (
                        <span style={{ fontSize: 10, color: "#e05c5c", fontWeight: 600 }}>max {item.qty}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── My Carts Tab ──────────────────────────────────────────────────────────────
function MyCartsTab({ carts, onCheckout, onDeleteCart, onUpdateCartItem, onAddMoreItems, cartFilterType, cartSort, role }) {
  let activeCarts = carts.filter((c) => c.status === "draft" || c.status === "pending");
  if (cartFilterType && cartFilterType !== "all") {
    activeCarts = activeCarts.filter((c) => c.type === cartFilterType);
  }
  activeCarts = [...activeCarts].sort((a, b) =>
    cartSort === "oldest"
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt)
  );
  if (activeCarts.length === 0) {
    return (
      <div className="empty-carts">
        <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>No active carts</div>
        <div style={{ fontSize: 13, color: "#888" }}>Use Stock In or Stock Out to create a cart</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {activeCarts.map((cart) => (
        <div key={cart.id} className="cart-card">
          <div className="cart-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`picker-type-badge ${cart.type === "stock_in" ? "badge-type-in" : "badge-type-out"}`}>
                {cart.type === "stock_in" ? "▼ Stock In" : "▲ Stock Out"}
              </span>
              <span className="cart-card-id">{cart.cartId}</span>
              <span className={`cart-status-badge ${cart.status === "draft" ? "status-ongoing" : `status-${cart.status}`}`}>
                {cart.status === "pending" ? "Pending Approval" : cart.status === "approved" ? "Approved" : cart.status === "declined" ? "Declined" : "On Going"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#888" }}>
                {new Date(cart.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" · "}
                {new Date(cart.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {cart.status === "draft" && (
                <>
                  <button onClick={() => onAddMoreItems(cart.id)} className="cancel-btn" style={{ fontSize: 12 }}>
                    + Add Items
                  </button>
                  <button onClick={() => onCheckout(cart.id)} className="approve-btn">
                    Checkout
                  </button>
                  <button onClick={() => onDeleteCart(cart.id)} className="decline-btn">
                    Delete
                  </button>
                </>
              )}
              {cart.status === "declined" && cart.declineReason && (
                <span style={{ fontSize: 12, color: "#e05c5c" }}>Reason: {cart.declineReason}</span>
              )}
            </div>
          </div>

          <div className="cart-card-items">
            {cart.items.map((ci, idx) => (
              <div key={idx} className="cart-item-row">
                <span className="cart-item-sku-sm">{ci.sku}</span>
                <span className="cart-item-name-sm">{ci.itemName}</span>
                {cart.status === "draft" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => onUpdateCartItem(cart.id, idx, ci.qty - 1)}
                      className="qty-btn qty-minus"
                      style={{ width: 22, height: 22, fontSize: 14 }}
                    >−</button>
                    <input
                      type="number"
                      min="1"
                      value={ci.qty}
                      onChange={(e) => onUpdateCartItem(cart.id, idx, parseInt(e.target.value) || 1)}
                      className="qty-display"
                      style={{ width: 42, fontSize: 12, padding: "2px 4px" }}
                    />
                    <button
                      onClick={() => onUpdateCartItem(cart.id, idx, ci.qty + 1)}
                      className="qty-btn qty-plus"
                      style={{ width: 22, height: 22, fontSize: 14 }}
                    >+</button>
                    <span className="cart-item-qty-sm" style={{ marginLeft: 2 }}>{ci.unit}</span>
                  </div>
                ) : (
                  <span className="cart-item-qty-sm">× {ci.qty} {ci.unit}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity Log List with expandable cart details ───────────────────────────
function ActivityLogList({ entries, carts }) {
  const [expanded, setExpanded] = useState({});
  function toggle(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  if (entries.length === 0) {
    return <div style={{ textAlign: "center", padding: "2rem", fontSize: 13, color: "#888" }}>No entries match your filters.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map((entry) => {
        const cartMatch = carts.find((c) => entry.detail && entry.detail.includes(c.cartId));
        const hasItems = cartMatch && cartMatch.items && cartMatch.items.length > 0;
        const isOpen = expanded[entry.id];
        return (
          <div key={entry.id} className="activity-entry" style={{ flexDirection: "column", alignItems: "stretch", gap: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="activity-entry-left">
                <span className="activity-entry-action">{entry.action}</span>
                <span className="activity-entry-detail">{entry.detail}</span>
                <span className="activity-entry-role">by {entry.role}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div className="activity-entry-time">
                  <div>{new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div>{new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                {hasItems && (
                  <button
                    onClick={() => toggle(entry.id)}
                    style={{ background: "none", border: "1px solid var(--field-border)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "var(--muted)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {isOpen ? "▲ Hide items" : "▼ Show items"}
                  </button>
                )}
              </div>
            </div>
            {hasItems && isOpen && (
              <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  Cart {cartMatch.cartId} · {cartMatch.items.length} item(s)
                </div>
                {cartMatch.items.map((ci, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 12, fontSize: 12, alignItems: "center" }}>
                    <span style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "var(--muted)", minWidth: 80 }}>{ci.sku}</span>
                    <span style={{ flex: 1, color: "var(--text)", fontWeight: 500 }}>{ci.itemName}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>× {ci.qty} {ci.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InventoryManagement() {
  const { role, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("crave_theme") || "dark");
  const isDark = theme === "dark";

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("crave_theme", next);
  }

  // ── Persisted state ──
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_inventory_items")) || []; } catch { return []; }
  });
  const [nextId, setNextId] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_inventory_nextId")) || 1; } catch { return 1; }
  });
  const [carts, setCarts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_inventory_carts")) || []; } catch { return []; }
  });
  const [requests, setRequests] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_inventory_requests")) || []; } catch { return []; }
  });
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_inventory_notifications")) || []; } catch { return []; }
  });
  const [activityLog, setActivityLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_inventory_log")) || []; } catch { return []; }
  });
  const [itemHistory, setItemHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_inventory_history")) || {}; } catch { return {}; }
  });

  // ── Persist effects ──
  useEffect(() => { localStorage.setItem("crave_inventory_items", JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem("crave_inventory_nextId", JSON.stringify(nextId)); }, [nextId]);
  useEffect(() => { localStorage.setItem("crave_inventory_carts", JSON.stringify(carts)); }, [carts]);
  useEffect(() => { localStorage.setItem("crave_inventory_requests", JSON.stringify(requests)); }, [requests]);
  useEffect(() => { localStorage.setItem("crave_inventory_notifications", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("crave_inventory_log", JSON.stringify(activityLog)); }, [activityLog]);
  useEffect(() => { localStorage.setItem("crave_inventory_history", JSON.stringify(itemHistory)); }, [itemHistory]);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "carts" | "requests" | "log"
  const [pickerType, setPickerType] = useState(null); // "stock_in" | "stock_out" | null
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [declineModal, setDeclineModal] = useState(false);
  const [declineTarget, setDeclineTarget] = useState(null); // { type: "request" | "cart", id }
  const [declineReason, setDeclineReason] = useState("");
  const [logFilterAction, setLogFilterAction] = useState("All");
  const [logFilterDate, setLogFilterDate] = useState("All");
  const [logSort, setLogSort] = useState("Newest");
  const [cartFilterType, setCartFilterType] = useState("all");
  const [cartSort, setCartSort] = useState("newest");

  // ── Logging ──
  function logActivity(action, detail, itemId = null) {
    const entry = { id: Date.now(), timestamp: new Date().toISOString(), role, action, detail };
    setActivityLog((prev) => [entry, ...prev]);
    if (itemId !== null) {
      setItemHistory((prev) => ({ ...prev, [itemId]: [entry, ...(prev[itemId] || [])] }));
    }
  }

  // ── Notifications ──
  const unreadCount = notifications.filter((n) => !n.read).length;
  function dismissNotifications() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  // ── Stats ──
  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter((i) => i.qty > i.low).length,
    lowStock: items.filter((i) => i.qty > 0 && i.qty <= i.low).length,
    outStock: items.filter((i) => i.qty === 0).length,
  }), [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        (!q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || generateSKU(i.id).toLowerCase().includes(q)) &&
        (!filterCat || i.category === filterCat)
    );
  }, [items, search, filterCat]);

  // ── Item CRUD ──
  function openAdd() { setEditId(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) { setEditId(item.id); setForm({ name: item.name, category: item.category, qty: item.qty, unit: item.unit, low: item.low }); setModal(true); }
  function closeModal() { setModal(false); }
  function setField(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  function handleSave() {
    if (!form.name.trim()) return;
    const payload = { name: form.name.trim(), category: form.category, qty: parseInt(form.qty) || 0, unit: form.unit, low: parseInt(form.low) || 5 };
    if (role === "manager") {
      if (editId !== null) {
        setItems((prev) => prev.map((i) => i.id === editId ? { ...i, ...payload } : i));
        logActivity("Edit Item", `Edited "${payload.name}" — qty: ${payload.qty} ${payload.unit}, category: ${payload.category}`, editId);
      } else {
        const newId = nextId;
        setItems((prev) => [...prev, { ...payload, id: newId }]);
        setNextId((n) => n + 1);
        logActivity("Add Item", `Added "${payload.name}" (${generateSKU(newId)}) — qty: ${payload.qty} ${payload.unit}, category: ${payload.category}`, newId);
      }
    } else {
      const req = { id: Date.now(), type: "add", payload, status: "pending" };
      setRequests((prev) => [...prev, req]);
      alert("Request submitted! Waiting for manager approval.");
    }
    closeModal();
  }

  function handleDelete(id) {
    if (role !== "manager") return;
    if (window.confirm("Delete this item?")) {
      const item = items.find((i) => i.id === id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (item) logActivity("Delete Item", `Deleted "${item.name}" (${generateSKU(id)}) — last qty: ${item.qty} ${item.unit}`, id);
    }
  }

  // ── Cart system ──
  const [activeCartId, setActiveCartId] = useState(null);

  function openPicker(type) {
    setPickerType(type);
    setActiveTab("inventory");
  }

  function handleAddToCart(cartItems) {
    if (activeCartId) {
      // Merge into existing cart
      setCarts((prev) =>
        prev.map((c) => {
          if (c.id !== activeCartId) return c;
          const merged = [...c.items];
          cartItems.forEach((newItem) => {
            const existing = merged.findIndex((m) => m.itemId === newItem.itemId);
            if (existing >= 0) {
              merged[existing] = { ...merged[existing], qty: merged[existing].qty + newItem.qty };
            } else {
              merged.push(newItem);
            }
          });
          return { ...c, items: merged };
        })
      );
      setActiveCartId(null);
    } else {
      const newCart = {
        id: Date.now(),
        cartId: generateCartId(),
        type: pickerType,
        items: cartItems,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      setCarts((prev) => [newCart, ...prev]);
    }
    setPickerType(null);
    setActiveTab("carts");
  }

  function handleCheckout(cartId) {
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return;
    if (!window.confirm(`Submit cart ${cart.cartId} for approval?\n\n${cart.items.length} item(s) will be sent to the manager.`)) return;
    setCarts((prev) => prev.map((c) => c.id === cartId ? { ...c, status: "pending" } : c));
    const req = { id: Date.now(), type: "cart", cartId: cart.cartId, cartDbId: cart.id, cartType: cart.type, items: cart.items, status: "pending" };
    setRequests((prev) => [...prev, req]);
    logActivity("Cart Checkout", `Submitted cart ${cart.cartId} (${cart.type === "stock_in" ? "Stock In" : "Stock Out"}) — ${cart.items.length} item(s)`);
  }

  function handleDeleteCart(cartId) {
    if (window.confirm("Delete this cart?")) {
      setCarts((prev) => prev.filter((c) => c.id !== cartId));
    }
  }

  function handleUpdateCartItem(cartId, itemIndex, newQty) {
    const qty = Math.max(1, newQty);
    setCarts((prev) =>
      prev.map((c) => {
        if (c.id !== cartId) return c;
        const updatedItems = c.items.map((item, idx) =>
          idx === itemIndex ? { ...item, qty } : item
        );
        return { ...c, items: updatedItems };
      })
    );
  }

  function handleAddMoreItems(cartId) {
    setActiveCartId(cartId);
    setPickerType(carts.find((c) => c.id === cartId)?.type ?? "stock_in");
    setActiveTab("inventory");
  }

  // ── Request approval ──
  function approveRequest(reqId) {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;

    if (req.type === "cart") {
      // Apply all cart items
      req.items.forEach((ci) => {
        if (req.cartType === "stock_in") {
          setItems((prev) => prev.map((i) => i.id === ci.itemId ? { ...i, qty: i.qty + ci.qty } : i));
          logActivity("Stock In", `Added ${ci.qty} ${ci.unit} to "${ci.itemName}" (${ci.sku}) via cart ${req.cartId}`, ci.itemId);
        } else {
          setItems((prev) => prev.map((i) => i.id === ci.itemId ? { ...i, qty: Math.max(0, i.qty - ci.qty) } : i));
          logActivity("Stock Out", `Removed ${ci.qty} ${ci.unit} from "${ci.itemName}" (${ci.sku}) via cart ${req.cartId}`, ci.itemId);
        }
      });
      setCarts((prev) => prev.map((c) => c.id === req.cartDbId ? { ...c, status: "approved" } : c));
      setNotifications((prev) => [...prev, { id: Date.now(), message: `Your cart ${req.cartId} was approved.`, read: false }]);
      logActivity("Approve Cart", `Approved cart ${req.cartId} (${req.cartType === "stock_in" ? "Stock In" : "Stock Out"}) — ${req.items.length} item(s)`);
    } else if (req.type === "add") {
      const newId = nextId;
      setItems((prev) => [...prev, { ...req.payload, id: newId }]);
      setNextId((n) => n + 1);
      setNotifications((prev) => [...prev, { id: Date.now(), message: `Your "add item" request for "${req.payload.name}" was approved.`, read: false }]);
      logActivity("Approve Request", `Approved add item request for "${req.payload.name}" (${generateSKU(newId)})`);
    }

    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: "approved" } : r));
  }

  function openDeclineModal(reqId) {
    setDeclineTarget({ type: "request", id: reqId });
    setDeclineReason("");
    setDeclineModal(true);
  }

  function confirmDecline() {
    if (!declineTarget) return;
    const reqId = declineTarget.id;
    const req = requests.find((r) => r.id === reqId);
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: "declined", declineReason } : r));
    if (req) {
      if (req.type === "cart") {
        setCarts((prev) => prev.map((c) => c.id === req.cartDbId ? { ...c, status: "declined", declineReason } : c));
        setNotifications((prev) => [...prev, { id: Date.now(), message: `Your cart ${req.cartId} was declined${declineReason ? `: "${declineReason}"` : "."}`, read: false }]);
        logActivity("Decline Cart", `Declined cart ${req.cartId}${declineReason ? ` — Reason: "${declineReason}"` : ""}`);
      } else {
        setNotifications((prev) => [...prev, { id: Date.now(), message: `Your "add item" request for "${req.payload?.name}" was declined${declineReason ? `: "${declineReason}"` : "."}`, read: false }]);
        logActivity("Decline Request", `Declined add item request for "${req.payload?.name}"${declineReason ? ` — Reason: "${declineReason}"` : ""}`);
      }
    }
    setDeclineModal(false);
    setDeclineTarget(null);
    setDeclineReason("");
  }

  // ── History modal ──
  function openHistoryModal(item) { setHistoryTarget(item); setHistoryModal(true); }

  // ── Filtered log ──
  const filteredLog = useMemo(() => {
    const now = new Date();
    return [...activityLog]
      .filter((entry) => {
        if (logFilterAction !== "All" && entry.action !== logFilterAction) return false;
        if (logFilterDate === "Today") return new Date(entry.timestamp).toDateString() === now.toDateString();
        if (logFilterDate === "This Week") { const w = new Date(now); w.setDate(now.getDate() - 7); return new Date(entry.timestamp) >= w; }
        if (logFilterDate === "This Month") { const d = new Date(entry.timestamp); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
        return true;
      })
      .sort((a, b) => logSort === "Newest" ? new Date(b.timestamp) - new Date(a.timestamp) : new Date(a.timestamp) - new Date(b.timestamp));
  }, [activityLog, logFilterAction, logFilterDate, logSort]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const draftCartCount = carts.filter((c) => c.status === "draft").length;
  const colWidths = ["12%", "26%", "13%", "13%", "9%", "12%", "15%"];

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
              🔔 <span className="notif-count">{unreadCount}</span>
            </button>
          )}
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="body">
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

        {/* Tab bar */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "inventory" ? "tab-active" : ""}`}
            onClick={() => { setPickerType(null); setActiveCartId(null); setActiveTab("inventory"); }}
          >
            📦 Inventory
          </button>
          <button
            className={`tab-btn ${activeTab === "carts" ? "tab-active" : ""}`}
            onClick={() => { setPickerType(null); setActiveTab("carts"); }}
          >
            🛒 My Carts
            {draftCartCount > 0 && <span className="tab-count">{draftCartCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "tab-active" : ""}`}
            onClick={() => { setPickerType(null); setActiveTab("history"); }}
          >
            ✅ History
            {carts.filter((c) => c.status === "approved" || c.status === "declined").length > 0 && (
              <span className="tab-count" style={{ background: "rgba(36,170,65,0.15)", color: "#3dba5a" }}>
                {carts.filter((c) => c.status === "approved" || c.status === "declined").length}
              </span>
            )}
          </button>
          {role === "manager" && (
            <button
              className={`tab-btn ${activeTab === "requests" ? "tab-active" : ""}`}
              onClick={() => { setPickerType(null); setActiveTab("requests"); }}
            >
              📋 Requests
              {pendingCount > 0 && <span className="tab-count tab-count-pending">{pendingCount}</span>}
            </button>
          )}
          {role === "manager" && (
            <button
              className={`tab-btn ${activeTab === "log" ? "tab-active" : ""}`}
              onClick={() => { setPickerType(null); setActiveTab("log"); }}
            >
              🕓 Activity Log
              {activityLog.length > 0 && <span className="tab-count">{activityLog.length}</span>}
            </button>
          )}
        </div>

        {/* ── Inventory Tab ── */}
        {activeTab === "inventory" && (
          <>
            {/* Toolbar */}
            <div className="toolbar">
              <input
                type="text"
                placeholder="Search by name, category, or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="select-input">
                <option value="">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <button
                onClick={() => openPicker("stock_in")}
                className={`action-btn-toolbar stock-in-btn ${pickerType === "stock_in" ? "active-picker" : ""}`}
              >
                ▼ Stock In
              </button>
              <button
                onClick={() => openPicker("stock_out")}
                className={`action-btn-toolbar stock-out-btn ${pickerType === "stock_out" ? "active-picker" : ""}`}
              >
                ▲ Stock Out
              </button>

              <button onClick={openAdd} className="add-btn">
                + {role === "manager" ? "Add Item" : "Request Item"}
              </button>
            </div>

            {/* Stock Picker Panel */}
            {pickerType && (
              <>
                {activeCartId && (
                  <div style={{ marginBottom: 8, fontSize: 12, color: "#6a9fd8", background: "rgba(90,120,200,0.08)", border: "1px solid rgba(90,120,200,0.2)", borderRadius: 8, padding: "6px 14px" }}>
                    ✏️ Adding items to existing cart — items will be merged in
                  </div>
                )}
                <StockPickerPanel
                  items={items}
                  type={pickerType}
                  onAddToCart={handleAddToCart}
                  onClose={() => { setPickerType(null); setActiveCartId(null); }}
                />
              </>
            )}

            {/* Table */}
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {["SKU", "Name", "Category", "Quantity", "Low At", "Status", "Actions"].map((h, i) => (
                      <th key={h} className="th" style={{ width: colWidths[i], textAlign: "center" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="td empty-state">
                        {items.length === 0
                          ? "No items yet — click + Add Item to get started"
                          : "No items match your search"}
                      </td>
                    </tr>
                  ) : filtered.map((item) => {
                    const { cls, label } = getStatus(item);
                    return (
                      <tr key={item.id}>
                        <td className="td td-sku" style={{ width: colWidths[0], textAlign: "center" }}>{generateSKU(item.id)}</td>
                        <td className="td td-name" style={{ width: colWidths[1], textAlign: "center" }} title={item.name}>{item.name}</td>
                        <td className="td" style={{ width: colWidths[2], textAlign: "center" }}>{item.category}</td>
                        <td className="td" style={{ width: colWidths[3], textAlign: "center" }}>{item.qty} <span style={{ color: "#888", fontSize: 12 }}>{item.unit}</span></td>
                        <td className="td" style={{ width: colWidths[4], textAlign: "center" }}>{item.low} <span style={{ color: "#888", fontSize: 12 }}>{item.unit}</span></td>
                        <td className="td" style={{ width: colWidths[5], textAlign: "left" }}>
                          <span className={`badge badge-${cls}`}>{label}</span>
                        </td>
                        <td className="td" style={{ width: colWidths[6], textAlign: "center" }}>
                          {role === "manager" && <button onClick={() => openEdit(item)} title="Edit" className="action-btn">✏️</button>}
                          {role === "manager" && <button onClick={() => handleDelete(item.id)} title="Delete" className="action-btn">🗑️</button>}
                          {role === "manager" && <button onClick={() => openHistoryModal(item)} title="History" className="action-btn">🕓</button>}
                          {role === "member" && <button onClick={() => openHistoryModal(item)} title="History" className="action-btn">🕓</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="footer-count">{filtered.length} of {items.length} items</div>

            {/* Member notifications */}
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
          </>
        )}

        {/* ── My Carts Tab ── */}
        {activeTab === "carts" && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>My Carts</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select value={cartFilterType} onChange={(e) => setCartFilterType(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
                  <option value="all">All Types</option>
                  <option value="stock_in">Stock In</option>
                  <option value="stock_out">Stock Out</option>
                </select>
                <select value={cartSort} onChange={(e) => setCartSort(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <button onClick={() => { setPickerType("stock_in"); setActiveTab("inventory"); }} className="action-btn-toolbar stock-in-btn">▼ New Stock In</button>
                <button onClick={() => { setPickerType("stock_out"); setActiveTab("inventory"); }} className="action-btn-toolbar stock-out-btn">▲ New Stock Out</button>
              </div>
            </div>
            <MyCartsTab
              carts={carts}
              onCheckout={handleCheckout}
              onDeleteCart={handleDeleteCart}
              onUpdateCartItem={handleUpdateCartItem}
              onAddMoreItems={handleAddMoreItems}
              cartFilterType={cartFilterType}
              cartSort={cartSort}
              role={role}
            />
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === "history" && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div className="section-label" style={{ marginBottom: 0 }}>Cart History</div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                {carts.filter((c) => c.status === "approved" || c.status === "declined").length} total
              </span>
            </div>
            {carts.filter((c) => c.status === "approved" || c.status === "declined").length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", fontSize: 13, color: "#888" }}>No cart history yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {carts.filter((c) => c.status === "approved" || c.status === "declined").map((cart) => (
                  <div key={cart.id} className="cart-card">
                    <div className="cart-card-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className={`picker-type-badge ${cart.type === "stock_in" ? "badge-type-in" : "badge-type-out"}`}>
                          {cart.type === "stock_in" ? "▼ Stock In" : "▲ Stock Out"}
                        </span>
                        <span className="cart-card-id">{cart.cartId}</span>
                        <span className={`cart-status-badge status-${cart.status}`}>
                          {cart.status === "approved" ? "Approved" : "Declined"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {cart.status === "declined" && cart.declineReason && (
                          <span style={{ fontSize: 12, color: "#e05c5c" }}>Reason: {cart.declineReason}</span>
                        )}
                        <span style={{ fontSize: 12, color: "#888" }}>
                          {new Date(cart.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {" · "}
                          {new Date(cart.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="cart-card-items">
                      {cart.items.map((ci, idx) => (
                        <div key={idx} className="cart-item-row">
                          <span className="cart-item-sku-sm">{ci.sku}</span>
                          <span className="cart-item-name-sm">{ci.itemName}</span>
                          <span className="cart-item-qty-sm">× {ci.qty} {ci.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Requests Tab (Manager) ── */}
        {activeTab === "requests" && role === "manager" && (
          <div style={{ marginTop: "1rem" }}>
            <div className="section-label">Pending Requests</div>
            {requests.filter((r) => r.status === "pending").length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", fontSize: 13, color: "#888" }}>No pending requests.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {requests.filter((r) => r.status === "pending").map((req) => (
                  <div key={req.id} className="pending-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span className="pending-type">
                          {req.type === "cart"
                            ? (req.cartType === "stock_in" ? "▼ Stock In Cart" : "▲ Stock Out Cart")
                            : "New Item Request"}
                        </span>
                        {req.type === "cart" && (
                          <span className="cart-card-id">{req.cartId}</span>
                        )}
                      </div>
                      {req.type === "cart" ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {req.items.map((ci, idx) => (
                            <span key={idx} className="pending-detail" style={{ background: "var(--color-bg-muted, rgba(0,0,0,0.05))", padding: "2px 8px", borderRadius: 4 }}>
                              {ci.sku} · {ci.itemName} × {ci.qty} {ci.unit}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="pending-detail">
                          {req.payload.name} — {req.payload.qty} {req.payload.unit} ({req.payload.category})
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => approveRequest(req.id)} className="approve-btn">Approve</button>
                      <button onClick={() => openDeclineModal(req.id)} className="decline-btn">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Processed requests history */}
            {requests.filter((r) => r.status !== "pending").length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <div className="section-label">Processed Requests</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {requests.filter((r) => r.status !== "pending").map((req) => (
                    <div key={req.id} className="pending-row" style={{ opacity: 0.7 }}>
                      <div style={{ flex: 1 }}>
                        <span className="pending-type" style={{ marginRight: 8 }}>
                          {req.type === "cart"
                            ? (req.cartType === "stock_in" ? "▼ Stock In Cart" : "▲ Stock Out Cart")
                            : "New Item Request"}
                        </span>
                        {req.type === "cart" && <span className="cart-card-id">{req.cartId}</span>}
                        {req.type !== "cart" && <span className="pending-detail">{req.payload?.name}</span>}
                        {req.declineReason && <span style={{ fontSize: 12, color: "#e05c5c", marginLeft: 8 }}>— {req.declineReason}</span>}
                      </div>
                      <span className={`cart-status-badge status-${req.status}`}>{req.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Activity Log Tab (Manager) ── */}
        {activeTab === "log" && role === "manager" && (
          <div className="activity-log-wrap" style={{ marginTop: "1rem" }}>
            <div className="activity-log-header">
              <div className="section-label" style={{ marginBottom: 0 }}>Activity Log</div>
              <button onClick={() => { setActivityLog([]); localStorage.removeItem("crave_inventory_log"); }} className="clear-log-btn">Clear Log</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
              <select value={logFilterAction} onChange={(e) => setLogFilterAction(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
                {["All", "Add Item", "Edit Item", "Delete Item", "Stock In", "Stock Out", "Cart Checkout", "Approve Cart", "Decline Cart", "Approve Request", "Decline Request"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <select value={logFilterDate} onChange={(e) => setLogFilterDate(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
                {["All", "Today", "This Week", "This Month"].map((d) => <option key={d}>{d}</option>)}
              </select>
              <select value={logSort} onChange={(e) => setLogSort(e.target.value)} className="select-input" style={{ width: "auto", fontSize: 12 }}>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
              <span style={{ fontSize: 12, alignSelf: "center", color: "#888" }}>
                {filteredLog.length} {filteredLog.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <ActivityLogList entries={filteredLog} carts={carts} />
          </div>
        )}
      </div>

      {/* ── Item History Modal ── */}
      {historyModal && historyTarget && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setHistoryModal(false); }} className="modal-bg">
          <div className="modal modal-large">
            <div className="modal-header-row">
              <div className="modal-title">🕓 History — {historyTarget.name} <span style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>({generateSKU(historyTarget.id)})</span></div>
              <button onClick={() => setHistoryModal(false)} className="modal-close-btn">✕</button>
            </div>
            <div className="history-list">
              {(itemHistory[historyTarget.id] || []).length === 0 ? (
                <div className="history-empty">No history yet for this item.</div>
              ) : (itemHistory[historyTarget.id] || []).map((entry, i) => (
                <div key={entry.id} className="history-entry">
                  <div className="history-timeline">
                    <div className="history-dot" />
                    {i < (itemHistory[historyTarget.id] || []).length - 1 && <div className="history-line" />}
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

      {/* ── Decline Modal ── */}
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

      {/* ── Add / Edit Item Modal ── */}
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
                  <input type="number" min="0" value={form.qty} onChange={(e) => setField("qty", e.target.value)} className="field-input" style={{ flex: 1 }} />
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