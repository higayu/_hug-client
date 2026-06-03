import { useState } from "react";
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import CorrectionPage from "./pages/CorrectionPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import "./index.css";

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      {!isLoginPage && (
        <div className="mobile-header">
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "white" }}>
            伴走ナビ
          </h2>
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.25rem",
            }}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* Sidebar & Overlay */}
      {!isLoginPage && (
        <>
          <div
            className={`mobile-overlay ${isMobileMenuOpen ? "visible" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <Sidebar
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        </>
      )}

      <main
        className="main-content"
        style={{ padding: isLoginPage ? 0 : undefined }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/correction" element={<CorrectionPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
