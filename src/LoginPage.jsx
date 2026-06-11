import { useAuth } from "./AuthContext";

const styles = {
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: "#0f0f0f",
    color: "#f0ede8",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 16,
    padding: "3rem 2.5rem",
    width: 340,
    textAlign: "center",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.25em",
    color: "#c8a96e",
    textTransform: "uppercase",
    fontWeight: 500,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  accent: { color: "#c8a96e" },
  divider: {
    width: 32,
    height: 2,
    background: "#c8a96e",
    borderRadius: 2,
    margin: "1.5rem auto",
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: "2rem",
  },
  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.05em",
    marginBottom: 12,
    transition: "opacity 0.15s",
  },
  managerBtn: {
    background: "#c8a96e",
    color: "#0f0f0f",
  },
  memberBtn: {
    background: "#1e1e1e",
    color: "#f0ede8",
    border: "1px solid #2a2a2a",
  },
};

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.eyebrow}>Stock Management</div>
        <div style={styles.title}>
          <span style={styles.accent}>C</span>RAVE
        </div>
        <div style={styles.divider} />
        <div style={styles.subtitle}>Select your role to continue</div>

        <button style={{ ...styles.btn, ...styles.managerBtn }} onClick={() => login("manager")}>
          Login as Manager
        </button>
        <button style={{ ...styles.btn, ...styles.memberBtn }} onClick={() => login("member")}>
          Login as Member
        </button>
      </div>
    </div>
  );
}