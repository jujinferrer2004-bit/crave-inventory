import { useState, useMemo, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { api } from "./api";
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

const emptyForm = { name: "", category: "Electronics", qty: 0, unit: "pcs", low: 5, serialNumber: "", barcode: "", supplier: "", dateOfPurchase: "", warrantyDate: "" };

// ─── Stock Picker Panel ────────────────────────────────────────────────────────
const DEFAULT_SUPPLIERS = ["Select Supplier", "Other"];

// ─── Suppliers Tab ────────────────────────────────────────────────────────────
function SuppliersTab() {
  const [suppliers, setSuppliers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_suppliers") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ name: "", contact: "", email: "", address: "", note: "" });
  const [editId, setEditId] = useState(null);
  const [supPage, setSupPage] = useState(1);
  const SUP_PAGE_SIZE = 10;
  const supTotalPages = Math.max(1, Math.ceil(suppliers.length / SUP_PAGE_SIZE));
  const paginatedSuppliers = suppliers.slice((supPage - 1) * SUP_PAGE_SIZE, supPage * SUP_PAGE_SIZE);

  function save() {
    if (!form.name.trim()) { alert("Supplier name is required."); return; }
    let updated;
    if (editId !== null) {
      updated = suppliers.map((s) => s.id === editId ? { ...s, ...form } : s);
    } else {
      updated = [...suppliers, { id: Date.now(), ...form }];
    }
    setSuppliers(updated);
    localStorage.setItem("crave_suppliers", JSON.stringify(updated));
    setForm({ name: "", contact: "", email: "", address: "", note: "" });
    setEditId(null);
  }

  function remove(id) {
    if (!window.confirm("Delete this supplier?")) return;
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    localStorage.setItem("crave_suppliers", JSON.stringify(updated));
  }

  function startEdit(s) {
    setForm({ name: s.name, contact: s.contact, email: s.email, address: s.address, note: s.note });
    setEditId(s.id);
  }

  function cancel() {
    setForm({ name: "", contact: "", email: "", address: "", note: "" });
    setEditId(null);
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <div className="section-label" style={{ marginBottom: "1rem" }}>🏢 Suppliers</div>
      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          {editId !== null ? "Edit Supplier" : "Add New Supplier"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label className="field-label">Supplier Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. ABC Trading" className="field-input" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="field-label">Contact Number</label>
            <input type="text" value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} placeholder="e.g. 09XX-XXX-XXXX" className="field-input" />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="field-label">Email</label>
            <input type="text" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="e.g. supplier@email.com" className="field-input" />
          </div>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label className="field-label">Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="e.g. 123 Supplier St." className="field-input" />
          </div>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label className="field-label">Notes</label>
            <input type="text" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional notes..." className="field-input" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={save} className="save-btn">{editId !== null ? "Update Supplier" : "Add Supplier"}</button>
          {editId !== null && <button onClick={cancel} className="cancel-btn">Cancel</button>}
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", fontSize: 13, color: "#888" }}>No suppliers yet — add one above.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                {["Name", "Contact", "Email", "Address", "Notes", "Actions"].map((h) => (
                  <th key={h} className="th" style={{ textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSuppliers.map((s) => (
                <tr key={s.id}>
                  <td className="td" style={{ textAlign: "center", fontWeight: 500 }}>{s.name}</td>
                  <td className="td" style={{ textAlign: "center" }}>{s.contact || <span style={{ color: "#bbb" }}>—</span>}</td>
                  <td className="td" style={{ textAlign: "center" }}>{s.email || <span style={{ color: "#bbb" }}>—</span>}</td>
                  <td className="td" style={{ textAlign: "center" }}>{s.address || <span style={{ color: "#bbb" }}>—</span>}</td>
                  <td className="td" style={{ textAlign: "center" }}>{s.note || <span style={{ color: "#bbb" }}>—</span>}</td>
                  <td className="td" style={{ textAlign: "center" }}>
                    <button onClick={() => startEdit(s)} className="action-btn" title="Edit">✏️</button>
                    <button onClick={() => remove(s.id)} className="action-btn" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        <Pagination page={supPage} totalPages={supTotalPages} setPage={setSupPage} total={suppliers.length} pageSize={SUP_PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}

function StockInForm({ onAddToCart, onClose }) {
  const [suppliers, setSuppliers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crave_suppliers") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    try { setSuppliers(JSON.parse(localStorage.getItem("crave_suppliers") || "[]")); } catch {}
  }, []);
  const SUPPLIERS = ["Select Supplier", ...suppliers.map((s) => s.name), "Other"];
  const [rows, setRows] = useState([
    { id: Date.now(), name: "", category: "Electronics", qty: 1, unit: "pcs", low: 5, serialNumber: "", serialNumbers: [], serialScanInput: "", barcode: "", supplier: "", supplierOther: "", dateOfPurchase: "", warrantyDate: "", deliveryReceiptNumber: "" }
  ]);

  function addRow() {
    setRows((prev) => [...prev, {
      id: Date.now() + Math.random(), name: "", category: "Electronics", qty: 1, unit: "pcs", low: 5,
      serialNumber: "", serialNumbers: [], serialScanInput: "", barcode: "", supplier: "", supplierOther: "", dateOfPurchase: "", warrantyDate: "", deliveryReceiptNumber: ""
    }]);
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function setField(id, field, value) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  }

  function addSerialNumber(id) {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const val = r.serialScanInput.trim();
      if (!val) return r;
      if (r.serialNumbers.length >= r.qty) return r;
      return { ...r, serialNumbers: [...r.serialNumbers, val], serialScanInput: "" };
    }));
  }

  function removeSerialNumber(id, index) {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      return { ...r, serialNumbers: r.serialNumbers.filter((_, i) => i !== index) };
    }));
  }

  function handleScanKeyDown(e, id) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSerialNumber(id);
    }
  }

  function handleSubmit() {
    const valid = rows.filter((r) => r.name.trim() && r.qty > 0);
    if (valid.length === 0) { alert("Please fill in at least one item name and quantity."); return; }

    const incomplete = valid.filter((r) => r.qty > 1 && r.serialNumbers.length > 0 && r.serialNumbers.length < r.qty);
    if (incomplete.length > 0) {
      const names = incomplete.map((r) => `• ${r.name}: ${r.serialNumbers.length} / ${r.qty} serials scanned`).join("\n");
      const proceed = window.confirm(
        `Some items are missing serial numbers:\n\n${names}\n\nSubmit anyway? Missing slots will be left blank.`
      );
      if (!proceed) return;
    }

    const cartItems = valid.map((r) => ({
      itemId: null,
      isNew: true,
      itemName: r.name.trim(),
      category: r.category,
      qty: parseInt(r.qty) || 1,
      unit: r.unit,
      low: parseInt(r.low) || 5,
      details: {
        serialNumber: r.serialNumber,
        serialNumbers: r.serialNumbers.length > 0 ? r.serialNumbers : null,
        barcode: r.barcode,
        supplier: r.supplier === "Other" ? r.supplierOther : r.supplier === "Select Supplier" ? "" : r.supplier,
        dateOfPurchase: r.dateOfPurchase,
        warrantyDate: r.warrantyDate,
        deliveryReceiptNumber: r.deliveryReceiptNumber,
      }
    }));
    onAddToCart(cartItems);
  }

  return (
    <div className="picker-panel">
      <div className="picker-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="picker-type-badge badge-type-in">▼ Stock In</span>
          <span className="picker-subtitle">Add new items to inventory</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={addRow} className="cancel-btn" style={{ fontSize: 12 }}>+ Add Row</button>
          <button onClick={handleSubmit} className="save-btn">🛒 Add to Cart</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Row header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Item {idx + 1}</span>
              {rows.length > 1 && (
                <button onClick={() => removeRow(row.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}>✕</button>
              )}
            </div>

            {/* Row 1: Name + Category */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 160 }}>
                <label className="field-label">Item Name *</label>
                <input type="text" value={row.name} onChange={(e) => setField(row.id, "name", e.target.value)} placeholder="e.g. HP Laptop 14s" className="field-input" />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label className="field-label">Category</label>
                <select value={row.category} onChange={(e) => setField(row.id, "category", e.target.value)} className="field-input">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Qty + Unit + Low threshold */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 80 }}>
                <label className="field-label">Quantity *</label>
                <input type="number" min="1" value={row.qty} onChange={(e) => setField(row.id, "qty", e.target.value)} className="field-input" />
              </div>
              <div style={{ flex: 1, minWidth: 90 }}>
                <label className="field-label">Unit</label>
                <select value={row.unit} onChange={(e) => setField(row.id, "unit", e.target.value)} className="field-input">
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 80 }}>
                <label className="field-label">Low Stock At</label>
                <input type="number" min="0" value={row.low} onChange={(e) => setField(row.id, "low", e.target.value)} className="field-input" />
              </div>
            </div>

            {/* Row 3: Serial + Barcode */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {row.qty <= 1 ? (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label className="field-label">Serial Number</label>
                  <input type="text" value={row.serialNumber} onChange={(e) => setField(row.id, "serialNumber", e.target.value)} placeholder="e.g. SN-00123456" className="field-input" />
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: 240 }}>
                  <label className="field-label">
                    Scan / Enter Serial Numbers ({row.serialNumbers.length} / {row.qty})
                  </label>
                  <input
                    type="text"
                    value={row.serialScanInput}
                    onChange={(e) => setField(row.id, "serialScanInput", e.target.value)}
                    onKeyDown={(e) => handleScanKeyDown(e, row.id)}
                    placeholder={row.serialNumbers.length >= row.qty ? "All serials entered" : "Scan or type, then press Enter"}
                    disabled={row.serialNumbers.length >= row.qty}
                    className="field-input"
                    autoFocus={false}
                  />
                  {row.serialNumbers.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {row.serialNumbers.map((sn, i) => (
                        <span
                          key={i}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: 12 }}
                        >
                          {sn}
                          <button
                            type="button"
                            onClick={() => removeSerialNumber(row.id, i)}
                            style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}
                          >✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                  {row.serialNumbers.length < row.qty && row.serialNumbers.length > 0 && (
                    <div style={{ fontSize: 11, color: "#e0a000", marginTop: 4 }}>
                      {row.qty - row.serialNumbers.length} more needed
                    </div>
                  )}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="field-label">Barcode</label>
                <input type="text" value={row.barcode} onChange={(e) => setField(row.id, "barcode", e.target.value)} placeholder="e.g. 4901234567890" className="field-input" />
              </div>
            </div>

{/* Row 3b: Delivery Receipt Number */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="field-label">Delivery Receipt No.</label>
                <input type="text" value={row.deliveryReceiptNumber} onChange={(e) => setField(row.id, "deliveryReceiptNumber", e.target.value)} placeholder="e.g. DR-2024-00123" className="field-input" />
              </div>
            </div>

            {/* Row 4: Supplier */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="field-label">Supplier</label>
                <select value={row.supplier} onChange={(e) => setField(row.id, "supplier", e.target.value)} className="field-input">
                  {SUPPLIERS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {row.supplier === "Other" && (
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label className="field-label">Supplier Name</label>
                  <input type="text" value={row.supplierOther} onChange={(e) => setField(row.id, "supplierOther", e.target.value)} placeholder="Type supplier name..." className="field-input" />
                </div>
              )}
            </div>

            {/* Row 5: Dates */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="field-label">Date of Purchase</label>
                <input type="date" value={row.dateOfPurchase} onChange={(e) => setField(row.id, "dateOfPurchase", e.target.value)} className="field-input" />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="field-label">Warranty Date</label>
                <input type="date" value={row.warrantyDate} onChange={(e) => setField(row.id, "warrantyDate", e.target.value)} className="field-input" />
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

function StockOutPanel({ items, onAddToCart, onClose }) {
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");

  function setQty(id, val) {
    const n = Math.max(0, parseInt(val) || 0);
    setQuantities((prev) => ({ ...prev, [id]: n }));
  }
  function increment(id) { setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 })); }
  function decrement(id) { setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) })); }

  const filtered = items.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = Object.values(quantities).filter((q) => q > 0).length;

  function handleAddToCart() {
    const cartItems = items
      .filter((i) => (quantities[i.id] || 0) > 0)
      .map((i) => ({ itemId: i.id, isNew: false, itemName: i.name, qty: quantities[i.id], unit: i.unit, details: {} }));
    if (cartItems.length === 0) return;
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
    onAddToCart(cartItems);
  }

  return (
    <div className="picker-panel">
      <div className="picker-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="picker-type-badge badge-type-out">▲ Stock Out</span>
          <span className="picker-subtitle">Select items and quantities to remove</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {selectedCount > 0 && <span className="picker-selected-count">{selectedCount} item{selectedCount > 1 ? "s" : ""} selected</span>}
          <button onClick={handleAddToCart} className={`save-btn ${selectedCount === 0 ? "btn-disabled" : ""}`} disabled={selectedCount === 0}>🛒 Add to Cart</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" style={{ width: "100%", maxWidth: 320 }} />
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
        <table className="table" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th className="th" style={{ width: "30%", textAlign: "center" }}>NAME</th>
              <th className="th" style={{ width: "20%", textAlign: "center" }}>CATEGORY</th>
              <th className="th" style={{ width: "15%", textAlign: "center" }}>AVAILABLE</th>
              <th className="th" style={{ width: "15%", textAlign: "center" }}>STATUS</th>
              <th className="th" style={{ width: "20%", textAlign: "center" }}>QTY TO REMOVE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const qty = quantities[item.id] || 0;
              const { cls, label } = getStatus(item);
              return (
                <tr key={item.id} style={{ background: qty > 0 ? "rgba(192,57,43,0.04)" : "transparent" }}>
                  <td className="td td-name" style={{ textAlign: "center" }} title={item.name}>{item.name}</td>
                  <td className="td" style={{ textAlign: "center" }}>{item.category}</td>
                  <td className="td" style={{ textAlign: "center" }}>{item.qty} <span style={{ color: "#888", fontSize: 12 }}>{item.unit}</span></td>
                  <td className="td" style={{ textAlign: "center" }}><span className={`badge badge-${cls}`}>{label}</span></td>
                  <td className="td" style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <button onClick={() => decrement(item.id)} className="qty-btn qty-minus">−</button>
                      <input type="number" min="0" value={qty} onChange={(e) => setQty(item.id, e.target.value)} className="qty-display" style={{ borderColor: qty > item.qty ? "#e05c5c" : undefined }} />
                      <button onClick={() => increment(item.id)} className="qty-btn qty-plus">+</button>
                      <span className="qty-unit">{item.unit}</span>
                      {qty > item.qty && <span style={{ fontSize: 10, color: "#e05c5c", fontWeight: 600 }}>max {item.qty}</span>}
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

function StockPickerPanel({ items, type, onAddToCart, onClose }) {
  if (type === "stock_in") return <StockInForm onAddToCart={onAddToCart} onClose={onClose} />;
  return <StockOutPanel items={items} onAddToCart={onAddToCart} onClose={onClose} />;
}

// ─── My Carts Tab ──────────────────────────────────────────────────────────────
function MyCartsTab({ carts, onCheckout, onDeleteCart, onUpdateCartItem, onAddMoreItems, cartFilterType, cartSort, role, page, setPage, pageSize }) {
  let activeCarts = carts.filter((c) => c.status === "draft" || c.status === "pending");
  if (cartFilterType && cartFilterType !== "all") {
    activeCarts = activeCarts.filter((c) => c.type === cartFilterType);
  }
  activeCarts = [...activeCarts].sort((a, b) =>
    cartSort === "oldest"
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt)
  );
  const totalPages = Math.max(1, Math.ceil(activeCarts.length / pageSize));
  const paginated = activeCarts.slice((page - 1) * pageSize, page * pageSize);

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
      {paginated.map((cart) => (
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
              <div key={idx} className="cart-item-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                {ci.details?.serialNumbers && ci.details.serialNumbers.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 2 }}>
                      S/N ({ci.details.serialNumbers.length}/{ci.qty}):
                    </span>
                    {ci.details.serialNumbers.map((sn, i) => (
                      <span key={i} style={{ fontSize: 11, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px" }}>
                        {sn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    <Pagination page={page} totalPages={totalPages} setPage={setPage} total={activeCarts.length} pageSize={pageSize} />
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

// ─── Pagination ───────────────────────────────────────────────────────────────
function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginated = items.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [items.length]);
  return { page, setPage, totalPages, paginated };
}

function Pagination({ page, totalPages, setPage, total, pageSize }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--muted)" }}>Showing {from}–{to} of {total}</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => setPage(1)} disabled={page === 1} className="cancel-btn" style={{ fontSize: 11, padding: "3px 8px" }}>«</button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="cancel-btn" style={{ fontSize: 11, padding: "3px 8px" }}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} style={{ fontSize: 11, padding: "3px 6px", color: "var(--muted)" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={p === page ? "save-btn" : "cancel-btn"}
                style={{ fontSize: 11, padding: "3px 8px", minWidth: 28 }}
              >
                {p}
              </button>
            )
          )}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="cancel-btn" style={{ fontSize: 11, padding: "3px 8px" }}>›</button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="cancel-btn" style={{ fontSize: 11, padding: "3px 8px" }}>»</button>
      </div>
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
  const [items, setItems] = useState([]);
  const [carts, setCarts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load data from API on mount ──
  async function loadData() {
      try {
        const [fetchedItems, fetchedCarts, fetchedLogs] = await Promise.all([
          api.getItems(),
          api.getCarts(),
          role === "manager" ? api.getLogs() : Promise.resolve([]),
        ]);
        setItems(fetchedItems);

        // Map carts from Laravel format to React format
        const mappedCarts = fetchedCarts.map((c) => ({
          id: c.id,
          cartId: c.cart_id,
          type: c.type,
          status: c.status,
          declineReason: c.decline_reason,
          delivery: c.delivery,
          createdAt: c.created_at,
          items: (c.items || []).map((ci) => ({
            id: ci.id,
            itemId: ci.item_id,
            itemName: ci.item_name,
            category: ci.category,
            qty: ci.qty,
            unit: ci.unit,
            low: ci.low,
            isNew: ci.is_new,
            details: {
              serialNumber: ci.serial_number,
              serialNumbers: ci.serial_numbers,
              barcode: ci.barcode,
              supplier: ci.supplier,
              dateOfPurchase: ci.date_of_purchase,
              warrantyDate: ci.warranty_date,
            },
          })),
        }));
        setCarts(mappedCarts);

        // Map pending carts as requests
        const pendingRequests = mappedCarts
          .filter((c) => c.status === "pending")
          .map((c) => ({
            id: c.id,
            type: "cart",
            cartId: c.cartId,
            cartDbId: c.id,
            cartType: c.type,
            items: c.items,
            status: "pending",
            delivery: c.delivery,
          }));
        setRequests(pendingRequests);

        // Map logs
        const mappedLogs = fetchedLogs.map((l) => ({
          id: l.id,
          timestamp: l.created_at,
          role: l.role,
          action: l.action,
          detail: l.detail,
        }));
        setActivityLog(mappedLogs);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    loadData();
  }, [role]);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "carts" | "requests" | "log"
  const [pickerType, setPickerType] = useState(null); // "stock_in" | "stock_out" | null
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  
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
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [deliveryCartId, setDeliveryCartId] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({ recipientName: "", address: "", city: "", contactNumber: "", deliveryNote: "" });
  const [reportPeriod, setReportPeriod] = useState("Daily");
  const [reportTypeFilter, setReportTypeFilter] = useState("stock_in");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("stock_in");

  // ── Logging ── (handled by backend now)
  async function refreshLogs() {
    if (role !== "manager") return;
    try {
      const fetchedLogs = await api.getLogs();
      setActivityLog(fetchedLogs.map((l) => ({
        id: l.id,
        timestamp: l.created_at,
        role: l.role,
        action: l.action,
        detail: l.detail,
      })));
    } catch (err) {
      console.error("Failed to refresh logs", err);
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

  const [inventoryPage, setInventoryPage] = useState(1);
  const [cartsPage, setCartsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const PAGE_SIZE = 10;
  const colWidths = [];

  const filtered = useMemo(() => {
    setInventoryPage(1);
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        (!q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || generateSKU(i.id).toLowerCase().includes(q)) &&
        (!filterCat || i.category === filterCat)
    );
  }, [items, search, filterCat]);

  const paginatedFiltered = filtered.slice((inventoryPage - 1) * PAGE_SIZE, inventoryPage * PAGE_SIZE);
  const inventoryTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  

  async function handleDelete(id) {
    if (role !== "manager") return;
    if (window.confirm("Delete this item?")) {
      try {
        await api.deleteItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        await refreshLogs();
      } catch (err) {
        alert("Failed to delete item.");
      }
    }
  }

  // ── Cart system ──
  const [activeCartId, setActiveCartId] = useState(null);

  function openPicker(type) {
    setPickerType(type);
    setActiveTab("inventory");
  }

  async function handleAddToCart(cartItems) {
    try {
      const res = await api.createCart(pickerType, cartItems);
      const newCart = {
        id: res.id,
        cartId: res.cart_id,
        type: res.type,
        status: res.status,
        declineReason: res.decline_reason,
        delivery: res.delivery,
        createdAt: res.created_at,
        items: (res.items || []).map((ci) => ({
          id: ci.id,
          itemId: ci.item_id,
          itemName: ci.item_name,
          category: ci.category,
          qty: ci.qty,
          unit: ci.unit,
          low: ci.low,
          isNew: ci.is_new,
          details: {
            serialNumber: ci.serial_number,
            serialNumbers: ci.serial_numbers,
            barcode: ci.barcode,
            supplier: ci.supplier,
            dateOfPurchase: ci.date_of_purchase,
            warrantyDate: ci.warranty_date,
          },
        })),
      };
      setCarts((prev) => [newCart, ...prev]);
      setPickerType(null);
      setActiveTab("carts");
    } catch (err) {
      alert("Failed to create cart.");
    }
  }

  async function handleCheckout(cartId) {
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return;

    if (cart.type === "stock_in") {
      // Stock In doesn't need delivery — submit directly
      try {
        await api.checkoutCart(cartId, null);
        setCarts((prev) => prev.map((c) => c.id === cartId ? { ...c, status: "pending" } : c));
        const req = { id: cartId, type: "cart", cartId: cart.cartId, cartDbId: cart.id, cartType: cart.type, items: cart.items, status: "pending", delivery: null };
        setRequests((prev) => [...prev, req]);
      } catch (err) {
        alert("Failed to checkout cart.");
      }
    } else {
      // Stock Out needs delivery details
      setDeliveryCartId(cartId);
      setDeliveryForm({ recipientName: "", address: "", city: "", contactNumber: "", deliveryNote: "" });
      setDeliveryModal(true);
    }
  }

  async function confirmCheckout() {
    const cartId = deliveryCartId;
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return;
    try {
      await api.checkoutCart(cartId, deliveryForm);
      setCarts((prev) => prev.map((c) => c.id === cartId ? { ...c, status: "pending", delivery: deliveryForm } : c));
      const req = { id: cartId, type: "cart", cartId: cart.cartId, cartDbId: cart.id, cartType: cart.type, items: cart.items, status: "pending", delivery: deliveryForm };
      setRequests((prev) => [...prev, req]);
      setDeliveryModal(false);
      setDeliveryCartId(null);
    } catch (err) {
      alert("Failed to checkout cart.");
    }
  }

  async function handleDeleteCart(cartId) {
    if (window.confirm("Delete this cart?")) {
      try {
        await api.deleteCart(cartId);
        setCarts((prev) => prev.filter((c) => c.id !== cartId));
      } catch (err) {
        alert("Failed to delete cart.");
      }
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
  async function approveRequest(reqId) {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    try {
      await api.approveCart(reqId);
      const freshItems = await api.getItems();
      setItems(freshItems);
      setCarts((prev) => prev.map((c) => c.id === req.cartDbId ? { ...c, status: "approved" } : c));
      setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: "approved" } : r));
      setNotifications((prev) => [...prev, { id: Date.now(), message: `Cart ${req.cartId} was approved.`, read: false }]);
      await refreshLogs();
    } catch (err) {
      alert("Failed to approve cart.");
    }
  }

  function openDeclineModal(reqId) {
    setDeclineTarget({ type: "request", id: reqId });
    setDeclineReason("");
    setDeclineModal(true);
  }

  async function confirmDecline() {
    if (!declineTarget) return;
    const reqId = declineTarget.id;
    const req = requests.find((r) => r.id === reqId);
    try {
      await api.declineCart(reqId, declineReason);
      setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: "declined", declineReason } : r));
      if (req) {
        setCarts((prev) => prev.map((c) => c.id === req.cartDbId ? { ...c, status: "declined", declineReason } : c));
        setNotifications((prev) => [...prev, { id: Date.now(), message: `Cart ${req.cartId} was declined${declineReason ? `: "${declineReason}"` : "."}`, read: false }]);
      }
      await refreshLogs();
      setDeclineModal(false);
      setDeclineTarget(null);
      setDeclineReason("");
    } catch (err) {
      alert("Failed to decline cart.");
    }
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

const reportCarts = useMemo(() => {
    const now = new Date();
    return carts.filter((c) => {
      const d = new Date(c.createdAt);
      if (reportPeriod === "Daily") return d.toDateString() === now.toDateString();
      if (reportPeriod === "Weekly") { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
      if (reportPeriod === "Monthly") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (reportPeriod === "Yearly") return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [carts, reportPeriod]);

  const reportLogs = useMemo(() => {
    const now = new Date();
    return activityLog.filter((l) => {
      const d = new Date(l.timestamp);
      if (reportPeriod === "Daily") return d.toDateString() === now.toDateString();
      if (reportPeriod === "Weekly") { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
      if (reportPeriod === "Monthly") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (reportPeriod === "Yearly") return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [activityLog, reportPeriod]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const draftCartCount = carts.filter((c) => c.status === "draft").length;

async function exportDeliveryReceiptPDF(cart) {
    const delivery = cart.delivery || {};
    const receiptNumber = cart.cartId || "N/A";
    const date = new Date(cart.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    function toBase64(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = url;
      });
    }

    const [logo1, logo2, logo3] = await Promise.all([
      toBase64(new URL("./assets/CRAVE CORP HIGH QUALITY LOGO.png", import.meta.url).href),
      toBase64(new URL("./assets/CRAVE ADS LOGO SUPER HD.png", import.meta.url).href),
      toBase64(new URL("./assets/Cravetech-08.png", import.meta.url).href),
    ]);

    const ROWS_PER_PAGE = 25;
    const totalPages = Math.max(1, Math.ceil(cart.items.length / ROWS_PER_PAGE));

    const pages = Array.from({ length: totalPages }, (_, pageIdx) => {
      const pageItems = cart.items.slice(pageIdx * ROWS_PER_PAGE, (pageIdx + 1) * ROWS_PER_PAGE);
      const rows = pageItems.map((ci, idx) => `
        <tr>
          <td style="border:1px solid #333;padding:5px 8px;text-align:center;">${pageIdx * ROWS_PER_PAGE + idx + 1}</td>
          <td style="border:1px solid #333;padding:5px 8px;text-align:center;">${ci.qty}</td>
          <td style="border:1px solid #333;padding:5px 8px;text-align:center;">${ci.unit}</td>
          <td style="border:1px solid #333;padding:5px 8px;">${ci.itemName}</td>
        </tr>
      `).join("");

      const isLastPage = pageIdx === totalPages - 1;

      return `
        <div style="page-break-after: ${isLastPage ? "avoid" : "always"}; width:216mm; min-height:279mm; padding:15mm 18mm; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; font-family:Arial,sans-serif; font-size:12px; color:#000;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  ${logo1 ? `<img src="${logo1}" style="height:44px;object-fit:contain;mix-blend-mode:multiply;" />` : ""}
                  ${logo2 ? `<img src="${logo2}" style="height:44px;object-fit:contain;mix-blend-mode:multiply;" />` : ""}
                  ${logo3 ? `<img src="${logo3}" style="height:44px;object-fit:contain;mix-blend-mode:multiply;" />` : ""}
                </div>
                <div style="font-size:10px;">CRAVE DIGITAL ADVERTISING SUPPLIES AND SERVICES</div>
              </div>
              <div style="text-align:right;font-size:11px;line-height:1.6;">
                JS Building, Galo-Lacson Sts.<br/>
                Bacolod City<br/>
                <strong>MABELLE A. YEE - Proprietor</strong><br/>
                Tel. No. (034) 708-0328<br/>
                <strong>VAT Reg. TIN 931-643-930-000</strong>
              </div>
            </div>

            <div style="font-size:22px;font-weight:bold;font-style:italic;text-decoration:underline;margin:8px 0 14px 0;">DELIVERY RECEIPT</div>

            <div style="text-align:right;margin-bottom:14px;">
              <strong>No. ${receiptNumber}</strong><br/>
              Date: ${date}
              ${totalPages > 1 ? `<br/><span style="font-size:10px;color:#666;">Page ${pageIdx + 1} of ${totalPages}</span>` : ""}
            </div>

            ${pageIdx === 0 ? `
            <table style="width:100%;margin-bottom:14px;border-collapse:collapse;">
              <tr><td style="width:110px;padding:2px 0;">Delivered to:</td><td><u><strong>${delivery.recipientName || "—"}</strong></u></td></tr>
              <tr><td style="padding:2px 0;">Address:</td><td><u>${delivery.address || "—"}${delivery.city ? ", " + delivery.city : ""}</u></td></tr>
              <tr><td style="padding:2px 0;">Contact:</td><td><u>${delivery.contactNumber || "—"}</u></td></tr>
              ${delivery.deliveryNote ? `<tr><td style="padding:2px 0;">Note:</td><td><u>${delivery.deliveryNote}</u></td></tr>` : ""}
            </table>` : `<div style="margin-bottom:12px;font-size:11px;color:#666;">Continuation — Delivered to: <strong>${delivery.recipientName || "—"}</strong></div>`}

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <thead>
                <tr>
                  <th style="border:1px solid #333;padding:5px 8px;background:#f5f5f5;text-align:center;width:36px;">No.</th>
                  <th style="border:1px solid #333;padding:5px 8px;background:#f5f5f5;text-align:center;width:54px;">Qty</th>
                  <th style="border:1px solid #333;padding:5px 8px;background:#f5f5f5;text-align:center;width:64px;">Unit</th>
                  <th style="border:1px solid #333;padding:5px 8px;background:#f5f5f5;text-align:left;">Description</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          ${isLastPage ? `
          <div>
            <p style="margin-bottom:50px;">Received the following goods and articles in good condition.</p>
            <div style="border-top:1px solid #000;width:240px;font-style:italic;font-size:11px;padding-top:4px;">Customer's Signature Over Printed Name</div>
            <div style="font-size:10px;margin-top:30px;border-top:1px dashed #aaa;padding-top:8px;display:flex;justify-content:space-between;">
              <span>THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES.</span>
              <span>THIS DELIVERY RECEIPT SHALL BE VALID FOR FIVE (5) YEARS FROM THE DATE OF ATP</span>
            </div>
          </div>` : ""}
        </div>
      `;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Delivery Receipt - ${receiptNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #fff; }
          @media print {
            @page { size: letter portrait; margin: 0; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>${pages}</body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();

    // Trigger Save as PDF via print dialog
    setTimeout(() => {
      win.print();
    }, 800);
  }

  async function generateDeliveryReceipt(cart) {
    const delivery = cart.delivery || {};
    const receiptNumber = cart.cartId || "N/A";
    const date = new Date(cart.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    function toBase64(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = url;
      });
    }

    const [logo1, logo2, logo3] = await Promise.all([
      toBase64(new URL("./assets/CRAVE CORP HIGH QUALITY LOGO.png", import.meta.url).href),
      toBase64(new URL("./assets/CRAVE ADS LOGO SUPER HD.png", import.meta.url).href),
      toBase64(new URL("./assets/Cravetech-08.png", import.meta.url).href),
    ]);

    const ROWS_PER_PAGE = 20;
    const totalPages = Math.max(1, Math.ceil(cart.items.length / ROWS_PER_PAGE));

    const pages = Array.from({ length: totalPages }, (_, pageIdx) => {
      const pageItems = cart.items.slice(pageIdx * ROWS_PER_PAGE, (pageIdx + 1) * ROWS_PER_PAGE);
      const rows = pageItems.map((ci, idx) => `
        <tr>
          <td style="border:1px solid #333;padding:6px 10px;text-align:center;">${pageIdx * ROWS_PER_PAGE + idx + 1}</td>
          <td style="border:1px solid #333;padding:6px 10px;text-align:center;">${ci.qty}</td>
          <td style="border:1px solid #333;padding:6px 10px;text-align:center;">${ci.unit}</td>
          <td style="border:1px solid #333;padding:6px 10px;">${ci.itemName}</td>
        </tr>
      `).join("");

      const isLastPage = pageIdx === totalPages - 1;

      return `
        <div style="page-break-after: ${isLastPage ? "avoid" : "always"}; min-height: 340mm; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
              <div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                  ${logo1 ? `<img src="${logo1}" alt="Crave Corp" style="height:52px;object-fit:contain;mix-blend-mode:multiply;background:transparent;" />` : ""}
                  ${logo2 ? `<img src="${logo2}" alt="Crave Ads" style="height:52px;object-fit:contain;mix-blend-mode:multiply;background:transparent;" />` : ""}
                  ${logo3 ? `<img src="${logo3}" alt="Cravetech" style="height:52px;object-fit:contain;mix-blend-mode:multiply;background:transparent;" />` : ""}
                </div>
                <div style="font-size:11px;margin-bottom:4px;">CRAVE DIGITAL ADVERTISING SUPPLIES AND SERVICES</div>
              </div>
              <div style="text-align:right;font-size:12px;line-height:1.6;">
                JS Building, Galo-Lacson Sts.<br/>
                Bacolod City<br/>
                <strong>MABELLE A. YEE - Proprietor</strong><br/>
                Tel. No. (034) 708-0328<br/>
                <strong>VAT Reg. TIN 931-643-930-000</strong>
              </div>
            </div>

            <div style="font-size:26px;font-weight:bold;font-style:italic;text-decoration:underline;margin:10px 0 20px 0;">DELIVERY RECEIPT</div>

            <div style="text-align:right;margin-bottom:20px;">
              <strong>No. ${receiptNumber}</strong><br/>
              Date: ${date}
              ${totalPages > 1 ? `<br/><span style="font-size:11px;color:#666;">Page ${pageIdx + 1} of ${totalPages}</span>` : ""}
            </div>

            ${pageIdx === 0 ? `
            <table style="width:100%;margin-bottom:20px;border-collapse:collapse;">
              <tr>
                <td style="width:120px;padding:2px 0;">Delivered to:</td>
                <td><u><strong>${delivery.recipientName || "—"}</strong></u></td>
              </tr>
              <tr>
                <td style="padding:2px 0;">Address:</td>
                <td><u>${delivery.address || "—"}${delivery.city ? ", " + delivery.city : ""}</u></td>
              </tr>
              <tr>
                <td style="padding:2px 0;">Contact:</td>
                <td><u>${delivery.contactNumber || "—"}</u></td>
              </tr>
              ${delivery.deliveryNote ? `<tr><td style="padding:2px 0;">Note:</td><td><u>${delivery.deliveryNote}</u></td></tr>` : ""}
            </table>` : `<div style="margin-bottom:16px;font-size:12px;color:#666;">Continuation — Delivered to: <strong>${delivery.recipientName || "—"}</strong></div>`}

            <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
              <thead>
                <tr>
                  <th style="border:1px solid #333;padding:6px 10px;background:#f5f5f5;text-align:center;width:40px;">No.</th>
                  <th style="border:1px solid #333;padding:6px 10px;background:#f5f5f5;text-align:center;width:60px;">Qty</th>
                  <th style="border:1px solid #333;padding:6px 10px;background:#f5f5f5;text-align:center;width:70px;">Unit</th>
                  <th style="border:1px solid #333;padding:6px 10px;background:#f5f5f5;text-align:left;">Description</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          ${isLastPage ? `
          <div>
            <p style="margin-bottom:60px;">Received the following goods and articles in good condition.</p>
            <div style="border-top:1px solid #000;width:260px;font-style:italic;font-size:12px;padding-top:4px;">Customer's Signature Over Printed Name</div>
            <div style="font-size:11px;margin-top:40px;border-top:1px dashed #aaa;padding-top:10px;display:flex;justify-content:space-between;">
              <span>THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES.</span>
              <span>THIS DELIVERY RECEIPT SHALL BE VALID FOR FIVE (5) YEARS FROM THE DATE OF ATP</span>
            </div>
          </div>` : ""}
        </div>
      `;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Delivery Receipt - ${receiptNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; margin: 0; padding: 20mm 20mm; color: #000; width: 216mm; min-height: 356mm; }
          @media print {
            body { padding: 15mm 20mm; margin: 0; }
            @page { size: 8.5in 14in portrait; margin: 0; }
          }
        </style>
      </head>
      <body>
        ${pages}
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 800);
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 16, color: "var(--muted)" }}>Loading...</div>;

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
            onClick={() => { setPickerType(null); setActiveTab("inventory"); }}
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
              onClick={() => { setPickerType(null); setActiveTab("requests"); loadData(); }}
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
          {role === "manager" && (
            <button
              className={`tab-btn ${activeTab === "reports" ? "tab-active" : ""}`}
              onClick={() => { setPickerType(null); setActiveTab("reports"); }}
            >
              📊 Reports
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === "suppliers" ? "tab-active" : ""}`}
            onClick={() => { setPickerType(null); setActiveTab("suppliers"); }}
          >
            🏢 Suppliers
          </button>
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

              
            </div>

            {/* Stock Picker Panel */}
            {pickerType && (
              <>
                
                <StockPickerPanel
                  items={items}
                  type={pickerType}
                  onAddToCart={handleAddToCart}
                  onClose={() => { setPickerType(null); setActiveCartId(null); }}
                />
              </>
            )}

            {/* Table */}
            <div className="table-wrap" style={{ overflowX: "auto" }}>
              <table className="table" style={{ minWidth: 1100 }}>
                <thead>
                  <tr>
                    {["Name", "Category", "Quantity", "Low At", "Serial No.", "Barcode", "Date Purchased", "Warranty Date", "Status", "Actions"].map((h, i) => (
                      <th key={h} className="th" style={{ width: colWidths[i], textAlign: "center" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="td empty-state">
                        {items.length === 0
                          ? "No items yet — use Stock In to add your first item"
                          : "No items match your search"}
                      </td>
                    </tr>
                  ) : paginatedFiltered.map((item) => {
                    const { cls, label } = getStatus(item);
                    return (
                      <tr key={item.id}>
                        <td className="td td-name" style={{ width: colWidths[0], textAlign: "center" }} title={item.name}>{item.name}</td>
                        <td className="td" style={{ width: colWidths[1], textAlign: "center" }}>{item.category}</td>
                        <td className="td" style={{ width: colWidths[2], textAlign: "center" }}>{item.qty} <span style={{ color: "#888", fontSize: 12 }}>{item.unit}</span></td>
                        <td className="td" style={{ width: colWidths[3], textAlign: "center" }}>{item.low} <span style={{ color: "#888", fontSize: 12 }}>{item.unit}</span></td>
                        <td className="td" style={{ textAlign: "center" }}>{item.serial_number || <span style={{ color: "#bbb" }}>—</span>}</td>
<td className="td" style={{ textAlign: "center" }}>{item.barcode || <span style={{ color: "#bbb" }}>—</span>}</td>
<td className="td" style={{ textAlign: "center" }}>{item.date_of_purchase ? new Date(item.date_of_purchase).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span style={{ color: "#bbb" }}>—</span>}</td>
<td className="td" style={{ textAlign: "center" }}>{item.warranty_date ? new Date(item.warranty_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span style={{ color: "#bbb" }}>—</span>}</td>
<td className="td" style={{ textAlign: "left" }}>
  <span className={`badge badge-${cls}`}>{label}</span>
</td>
<td className="td" style={{ textAlign: "center" }}>
                          
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
            <Pagination page={inventoryPage} totalPages={inventoryTotalPages} setPage={setInventoryPage} total={filtered.length} pageSize={PAGE_SIZE} />

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
              page={cartsPage}
              setPage={setCartsPage}
              pageSize={PAGE_SIZE}
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
            <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
              <button
                onClick={() => { setHistoryTypeFilter("stock_in"); setHistoryPage(1); }}
                className={historyTypeFilter === "stock_in" ? "tab-btn tab-active" : "tab-btn"}
              >
                ▼ Stock In
              </button>
              <button
                onClick={() => { setHistoryTypeFilter("stock_out"); setHistoryPage(1); }}
                className={historyTypeFilter === "stock_out" ? "tab-btn tab-active" : "tab-btn"}
              >
                ▲ Stock Out
              </button>
            </div>
            {(() => {
              const historyCarts = carts.filter((c) =>
                (c.status === "approved" || c.status === "declined") &&
                (historyTypeFilter === "all" || c.type === historyTypeFilter)
              );
              const historyTotalPages = Math.max(1, Math.ceil(historyCarts.length / PAGE_SIZE));
              const paginatedHistory = historyCarts.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);
              return historyCarts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", fontSize: 13, color: "#888" }}>
                  No {historyTypeFilter === "stock_in" ? "stock in" : historyTypeFilter === "stock_out" ? "stock out" : ""} history yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {paginatedHistory.map((cart) => (
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
                          {cart.status === "approved" && cart.type === "stock_out" && cart.delivery && (
                            <>
                              <button
                                onClick={() => generateDeliveryReceipt(cart)}
                                className="cancel-btn"
                                style={{ fontSize: 11 }}
                              >
                                🖨️ Delivery Receipt
                              </button>
                              <button
                                onClick={() => exportDeliveryReceiptPDF(cart)}
                                className="cancel-btn"
                                style={{ fontSize: 11 }}
                              >
                                📄 Export PDF
                              </button>
                            </>
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
                            <span className="cart-item-name-sm">{ci.itemName}</span>
                            <span className="cart-item-qty-sm">× {ci.qty} {ci.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                <Pagination page={historyPage} totalPages={historyTotalPages} setPage={setHistoryPage} total={historyCarts.length} pageSize={PAGE_SIZE} />
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Requests Tab (Manager) ── */}
        {activeTab === "requests" && role === "manager" && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", gap: 16, marginBottom: "1rem" }}>
  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>▼ Stock In Requests</div>
  <div style={{ fontSize: 11, fontWeight: 700, color: "#e05c5c", letterSpacing: "0.08em", textTransform: "uppercase" }}>▲ Stock Out Requests</div>
</div>
<div className="section-label">Pending Requests</div>
            {(() => {
              const pendingReqs = requests.filter((r) => r.status === "pending");
              const reqTotalPages = Math.max(1, Math.ceil(pendingReqs.length / PAGE_SIZE));
              const paginatedReqs = pendingReqs.slice((requestsPage - 1) * PAGE_SIZE, requestsPage * PAGE_SIZE);
              return pendingReqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", fontSize: 13, color: "#888" }}>No pending requests.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {paginatedReqs.filter((r) => r.cartType === "stock_in").length > 0 && (
  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>▼ Stock In</div>
)}
{paginatedReqs.filter((r) => r.cartType === "stock_in").map((req) => (
  <div key={req.id} className="pending-row">
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span className="pending-type">▼ Stock In Cart</span>
        <span className="cart-card-id">{req.cartId}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {req.items.map((ci, idx) => (
          <div key={idx}>
            <span className="pending-detail" style={{ background: "var(--color-bg-muted, rgba(0,0,0,0.05))", padding: "2px 8px", borderRadius: 4 }}>
              {ci.itemName} × {ci.qty} {ci.unit}
            </span>
            {ci.details?.serialNumbers && ci.details.serialNumbers.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>
                  S/N ({ci.details.serialNumbers.length}/{ci.qty}):
                </span>
                {ci.details.serialNumbers.map((sn, i) => (
                  <span key={i} style={{ fontSize: 11, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px" }}>
                    {sn}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => approveRequest(req.id)} className="approve-btn">Approve</button>
      <button onClick={() => openDeclineModal(req.id)} className="decline-btn">Decline</button>
    </div>
  </div>
))}

{paginatedReqs.filter((r) => r.cartType === "stock_out").length > 0 && (
  <div style={{ fontSize: 11, fontWeight: 700, color: "#e05c5c", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, marginTop: 16 }}>▲ Stock Out</div>
)}
{paginatedReqs.filter((r) => r.cartType === "stock_out").map((req) => (
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
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {req.items.map((ci, idx) => (
                              <span key={idx} className="pending-detail" style={{ background: "var(--color-bg-muted, rgba(0,0,0,0.05))", padding: "2px 8px", borderRadius: 4 }}>
                                {ci.itemName} × {ci.qty} {ci.unit}
                              </span>
                            ))}
                          </div>
                          {req.delivery && (
                            <div style={{ fontSize: 12, color: "var(--muted)", background: "rgba(90,120,200,0.06)", border: "1px solid rgba(90,120,200,0.15)", borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>🚚 Delivery Info</span>
                              <span><strong>To:</strong> {req.delivery.recipientName} · {req.delivery.contactNumber}</span>
                              <span><strong>Address:</strong> {req.delivery.address}, {req.delivery.city}</span>
                              {req.delivery.deliveryNote && <span><strong>Note:</strong> {req.delivery.deliveryNote}</span>}
                            </div>
                          )}
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
              <Pagination page={requestsPage} totalPages={reqTotalPages} setPage={setRequestsPage} total={pendingReqs.length} pageSize={PAGE_SIZE} />
              </div>
            );
            })()}

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

        {/* ── Reports Tab (Manager) ── */}
        {activeTab === "reports" && role === "manager" && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>📊 Reports</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {["Daily", "Weekly", "Monthly", "Yearly"].map((p) => (
                  <button
                    key={p}
                    onClick={() => { setReportPeriod(p); setReportPage(1); }}
                    className={reportPeriod === p ? "save-btn" : "cancel-btn"}
                    style={{ fontSize: 12 }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => window.print()}
                  className="cancel-btn"
                  style={{ fontSize: 12 }}
                >
                  🖨️ Print / Export PDF
                </button>
              </div>
            </div>

            {/* Stock In / Stock Out sub-tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
              <button
                onClick={() => { setReportTypeFilter("stock_in"); setReportPage(1); }}
                className={reportTypeFilter === "stock_in" ? "tab-btn tab-active" : "tab-btn"}
              >
                ▼ Stock In
              </button>
              <button
                onClick={() => { setReportTypeFilter("stock_out"); setReportPage(1); }}
                className={reportTypeFilter === "stock_out" ? "tab-btn tab-active" : "tab-btn"}
              >
                ▲ Stock Out
              </button>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
              {[
                { label: "Stock In Carts", val: reportCarts.filter((c) => c.type === "stock_in").length },
                { label: "Stock Out Carts", val: reportCarts.filter((c) => c.type === "stock_out").length },
                { label: "Items Added", val: reportCarts.filter((c) => c.type === "stock_in" && c.status === "approved").reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.qty, 0), 0) },
                { label: "Items Removed", val: reportCarts.filter((c) => c.type === "stock_out" && c.status === "approved").reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.qty, 0), 0) },
              ].map(({ label, val }) => (
                <div key={label} className="stat-card">
                  <div className="stat-label">{label}</div>
                  <div className="stat-val">{val}</div>
                </div>
              ))}
            </div>

            {/* Filtered transactions table */}
            {(() => {
              const filteredReport = reportCarts.filter((c) =>
                reportTypeFilter === "all" || c.type === reportTypeFilter
              );
              const isIn = reportTypeFilter === "stock_in";
              const isOut = reportTypeFilter === "stock_out";
              const headerColor = isOut ? "rgba(224,92,92,0.06)" : "rgba(0,160,80,0.06)";
              const label = isIn ? "▼ Stock In Transactions" : isOut ? "▲ Stock Out Transactions" : "All Transactions";
              const labelColor = isOut ? "#e05c5c" : "var(--accent)";

              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: labelColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>({filteredReport.length} carts)</span>
                  </div>
                  <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <table className="table" style={{ minWidth: 650 }}>
                      <thead>
                        <tr style={{ background: reportTypeFilter === "all" ? "rgba(0,0,0,0.03)" : headerColor }}>
                          {["Cart ID", "Type", "Items", "Status", "Date"].map((h) => (
                            <th key={h} className="th" style={{ textAlign: "center", padding: "10px 12px" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReport.length === 0 ? (
                          <tr><td colSpan={5} className="td empty-state">No transactions in this period.</td></tr>
                        ) : filteredReport.slice((reportPage - 1) * PAGE_SIZE, reportPage * PAGE_SIZE).map((cart, idx) => (
                          <tr key={cart.id} style={{ background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}>
                            <td className="td" style={{ textAlign: "center", fontWeight: 600, fontSize: 12, color: cart.type === "stock_in" ? "var(--accent)" : "#e05c5c" }}>{cart.cartId}</td>
                            <td className="td" style={{ textAlign: "center" }}>
                              <span className={`picker-type-badge ${cart.type === "stock_in" ? "badge-type-in" : "badge-type-out"}`}>
                                {cart.type === "stock_in" ? "▼ In" : "▲ Out"}
                              </span>
                            </td>
                            <td className="td" style={{ textAlign: "left", padding: "8px 12px" }}>
                              {cart.items.map((ci, i) => (
                                <div key={i} style={{ fontSize: 12, padding: "1px 0" }}>
                                  <span style={{ fontWeight: 500 }}>{ci.itemName}</span>
                                  <span style={{ color: "var(--muted)", marginLeft: 6 }}>× {ci.qty} {ci.unit}</span>
                                </div>
                              ))}
                            </td>
                            <td className="td" style={{ textAlign: "center" }}>
                              <span className={`cart-status-badge status-${cart.status}`}>{cart.status}</span>
                            </td>
                            <td className="td" style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
                              {new Date(cart.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={reportPage} totalPages={Math.max(1, Math.ceil(filteredReport.length / PAGE_SIZE))} setPage={setReportPage} total={filteredReport.length} pageSize={PAGE_SIZE} />
                </>
              );
            })()}
          </div>
        )}

       

      {/* ── Suppliers Tab ── */}
        {activeTab === "suppliers" && <SuppliersTab />}

        {/* ── Activity Log Tab (Manager) ── */}
        {activeTab === "log" && role === "manager" && (
          <div className="activity-log-wrap" style={{ marginTop: "1rem" }}>
            <div className="activity-log-header">
              <div className="section-label" style={{ marginBottom: 0 }}>Activity Log</div>
              <button onClick={async () => { await api.clearLogs(); setActivityLog([]); }} className="clear-log-btn">Clear Log</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
              <select value={logFilterAction} onChange={(e) => { setLogFilterAction(e.target.value); setLogPage(1); }} className="select-input" style={{ width: "auto", fontSize: 12 }}>
                {["All", "Add Item", "Edit Item", "Delete Item", "Stock In", "Stock Out", "Cart Checkout", "Approve Cart", "Decline Cart", "Approve Request", "Decline Request"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <select value={logFilterDate} onChange={(e) => { setLogFilterDate(e.target.value); setLogPage(1); }} className="select-input" style={{ width: "auto", fontSize: 12 }}>
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
            {(() => {
              const logTotalPages = Math.max(1, Math.ceil(filteredLog.length / PAGE_SIZE));
              const paginatedLog = filteredLog.slice((logPage - 1) * PAGE_SIZE, logPage * PAGE_SIZE);
              return (
                <>
                  <ActivityLogList entries={paginatedLog} carts={carts} />
                  <Pagination page={logPage} totalPages={logTotalPages} setPage={setLogPage} total={filteredLog.length} pageSize={PAGE_SIZE} />
                </>
              );
            })()}
          </div>
        )}

      </div>

      {/* ── Item History Modal ── */}
      {historyModal && historyTarget && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setHistoryModal(false); }} className="modal-bg">
          <div className="modal modal-large">
            <div className="modal-header-row">
              <div className="modal-title">🕓 History — {historyTarget.name}</div>
              <button onClick={() => setHistoryModal(false)} className="modal-close-btn">✕</button>
            </div>
            <div className="history-list">
              {activityLog.filter((e) => e.detail && e.detail.includes(historyTarget.name)).length === 0 ? (
                <div className="history-empty">No history yet for this item.</div>
              ) : activityLog.filter((e) => e.detail && e.detail.includes(historyTarget.name)).map((entry, i) => (
                <div key={entry.id} className="history-entry">
                  <div className="history-timeline">
                    <div className="history-dot" />
                    {i < activityLog.filter((e) => e.detail && e.detail.includes(historyTarget.name)).length - 1 && <div className="history-line" />}
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

      {/* ── Delivery Details Modal ── */}
      {deliveryModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeliveryModal(false); }} className="modal-bg">
          <div className="modal" style={{ width: 420 }}>
            <div className="modal-title">🚚 Delivery Details</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: "1.25rem", marginTop: -12 }}>
              Fill in the delivery information before submitting for approval.
            </div>
            {[
              { label: "Recipient Name", input: <input type="text" value={deliveryForm.recipientName} onChange={(e) => setDeliveryForm((p) => ({ ...p, recipientName: e.target.value }))} placeholder="Full name of recipient" className="field-input" /> },
              { label: "Delivery Address", input: <input type="text" value={deliveryForm.address} onChange={(e) => setDeliveryForm((p) => ({ ...p, address: e.target.value }))} placeholder="Street address, building, unit" className="field-input" /> },
              { label: "City / Municipality", input: <input type="text" value={deliveryForm.city} onChange={(e) => setDeliveryForm((p) => ({ ...p, city: e.target.value }))} placeholder="City or municipality" className="field-input" /> },
              { label: "Contact Number", input: <input type="text" value={deliveryForm.contactNumber} onChange={(e) => setDeliveryForm((p) => ({ ...p, contactNumber: e.target.value }))} placeholder="e.g. 09XX-XXX-XXXX" className="field-input" /> },
              { label: "Delivery Note (optional)", input: <textarea value={deliveryForm.deliveryNote} onChange={(e) => setDeliveryForm((p) => ({ ...p, deliveryNote: e.target.value }))} placeholder="Special instructions, landmarks, etc." className="field-input textarea-field" /> },
            ].map(({ label, input }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label className="field-label">{label}</label>
                {input}
              </div>
            ))}
            <div className="modal-actions">
              <button onClick={() => setDeliveryModal(false)} className="cancel-btn">Cancel</button>
              <button
                onClick={confirmCheckout}
                className="save-btn"
                disabled={!deliveryForm.recipientName.trim() || !deliveryForm.address.trim() || !deliveryForm.city.trim()}
                style={{ opacity: (!deliveryForm.recipientName.trim() || !deliveryForm.address.trim() || !deliveryForm.city.trim()) ? 0.4 : 1 }}
              >
                Submit for Approval
              </button>
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

      
    </div>
  );
}