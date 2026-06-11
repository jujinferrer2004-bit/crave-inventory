import { useAuth } from "./AuthContext";
import "./styles.css";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-eyebrow">Inventory Management</div>
        <div className="login-title">
          <span className="login-accent">C</span>RAVE
        </div>
        <div className="divider" style={{ margin: "1.5rem auto" }} />
        <div className="login-subtitle">Select your role to continue</div>

        <button className="login-btn login-btn-manager" onClick={() => login("manager")}>
          Login as Manager
        </button>
        <button className="login-btn login-btn-member" onClick={() => login("member")}>
          Login as Member
        </button>
      </div>
    </div>
  );
}