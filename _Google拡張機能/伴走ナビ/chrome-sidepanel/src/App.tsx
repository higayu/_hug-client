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
import AiRecordEditer from "./pages/AiRecordEditer";
import ChatPage from "./pages/ChatPage";
import PersonalRecordPage from "./pages/PersonalRecordPage";
import HugPersonalRecordPage from "./pages/HugPersonalRecordPage";
import LoginPage from "./pages/LoginPage";
import { isAuthenticated } from "./lib/auth";
import "./index.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

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
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated() ? "/chat" : "/login"} replace />
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated() ? <Navigate to="/personal-record" replace /> : <LoginPage />
            }
          />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/ai-record-editer" element={<ProtectedRoute><AiRecordEditer /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/personal-record" element={<ProtectedRoute><PersonalRecordPage /></ProtectedRoute>} />
          <Route path="/hug-personal-record" element={<ProtectedRoute><HugPersonalRecordPage /></ProtectedRoute>} />
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
