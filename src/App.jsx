import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import InventoryManagement from "./InventoryManagement";

function Inner() {
  const { role } = useAuth();
  if (!role) return <LoginPage />;
  return <InventoryManagement />;
}

function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}

export default App;