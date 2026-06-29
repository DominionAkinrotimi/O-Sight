import React, { createContext, useState, useContext } from 'react';
import { Routes, Route, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, TrendingUp,
  PiggyBank, Lightbulb, UploadCloud, LogOut, Store, Menu, X
} from 'lucide-react';

import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Spending from './pages/Spending.jsx';
import Income from './pages/Income.jsx';
import Savings from './pages/Savings.jsx';
import Insights from './pages/Insights.jsx';
import Merchants from './pages/Merchants.jsx';

// ---- GLOBAL STATE CONTEXT ----
export const AnalysisContext = createContext(null);

export function useAnalysis() {
  return useContext(AnalysisContext);
}

// ---- DASHBOARD LAYOUT WITH SIDEBAR ----
import FilterPanel from './components/FilterPanel.jsx';

function DashboardLayout() {
  const { data, clearData, filterLoading } = useAnalysis();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!data) return <Navigate to="/" replace />;

  const profile = data.profile || {};
  const initials = (profile["Account Name"] || "U")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
    { to: "/spending", icon: PieChart, label: "Spending Analytics" },
    { to: "/merchants", icon: Store, label: "Merchants & Payees" },
    { to: "/income", icon: TrendingUp, label: "Income Analysis" },
    { to: "/savings", icon: PiggyBank, label: "Savings & Goals" },
    { to: "/insights", icon: Lightbulb, label: "Insights" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'mobile-open' : ''}`} onClick={closeSidebar} />
      
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1e293b' }} />
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationThickness: '3px' }}>Sight</h1>
          </div>
          <p>Financial Intelligence</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Analytics</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-profile-info">
              <div className="name">{profile["Account Name"] || "User"}</div>
              <div className="type">{profile["Account Type"] || "Account"}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
            onClick={() => { clearData(); }}
          >
            <UploadCloud size={14} /> New Statement
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-container" style={{ opacity: filterLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          <div style={{ display: 'none', marginBottom: '16px' }} className="mobile-menu-button">
            <button 
              className="btn btn-ghost" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              {sidebarOpen ? 'Close' : 'Menu'}
            </button>
          </div>
          <FilterPanel />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// ---- ROOT APP ----
function App() {
  const [data, setData] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  const clearData = () => setData(null);

  return (
    <AnalysisContext.Provider value={{ data, setData, clearData, filterLoading, setFilterLoading }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/spending" element={<Spending />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/income" element={<Income />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/insights" element={<Insights />} />
        </Route>
      </Routes>
    </AnalysisContext.Provider>
  );
}

export default App;
