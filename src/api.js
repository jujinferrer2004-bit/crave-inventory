const BASE = "http://127.0.0.1:8000/api";

function getToken() {
  return localStorage.getItem("crave_token");
}

async function request(method, path, body = null) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export const api = {
  login: (email, password) => request("POST", "/login", { email, password }),
  logout: () => request("POST", "/logout"),
  me: () => request("GET", "/me"),

  getItems: () => request("GET", "/items"),
  deleteItem: (id) => request("DELETE", `/items/${id}`),

  getCarts: () => request("GET", "/carts"),
  createCart: (type, items) => request("POST", "/carts", { type, items }),
  checkoutCart: (id, delivery) => request("POST", `/carts/${id}/checkout`, { delivery }),
  approveCart: (id) => request("POST", `/carts/${id}/approve`),
  declineCart: (id, reason) => request("POST", `/carts/${id}/decline`, { reason }),
  deleteCart: (id) => request("DELETE", `/carts/${id}`),

  getLogs: () => request("GET", "/logs"),
  clearLogs: () => request("DELETE", "/logs"),
};