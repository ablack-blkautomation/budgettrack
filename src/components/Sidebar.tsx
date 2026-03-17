"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
    <rect width="32" height="32" rx="8" fill="#111118"/>
    <text x="6" y="24" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#00ff88">B</text>
    <circle cx="26" cy="26" r="3" fill="#00ff88"/>
  </svg>
);

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navItems = [
    { name: "Dash", path: "/dashboard", icon: "📊" },
    { name: "History", path: "/dashboard/transactions", icon: "⌛" },
    { name: "Accounts", path: "/dashboard/accounts", icon: "💳" },
    { name: "Budgets", path: "/dashboard/budgets", icon: "💰" },
    { name: "Recur", path: "/dashboard/recurring", icon: "🔄" },
    { name: "Reports", path: "/dashboard/reports", icon: "📈" },
    { name: "Profile", path: "/dashboard/profile", icon: "👤" },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin", path: "/dashboard/admin", icon: "🛠️" });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: "2.5rem", display: 'flex', alignItems: 'center' }}>
          <Logo />
          <Link href="/dashboard" className="nav-logo" style={{ fontSize: "1.2rem", display: "block" }}>
            BudgetTrack<span>.</span>
          </Link>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", maxHeight: "calc(100vh - 250px)" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const label = item.name === "Dash" ? "Dashboard" : item.name === "Recur" ? "Recurring" : item.name;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="btn btn-secondary"
                style={{
                  justifyContent: "flex-start",
                  gap: "0.8rem",
                  background: isActive ? "rgba(0, 255, 136, 0.08)" : "transparent",
                  borderColor: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--foreground)",
                  padding: "0.8rem 1rem",
                  textTransform: "none",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", paddingBottom: "1rem" }}>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "flex-start", gap: "0.8rem", color: "var(--danger)", border: "none", background: "transparent" }}
          >
            <span>🚪</span> Logout
          </button>
          
          <div style={{ padding: "1rem 0 0 0.5rem", borderTop: "1px solid var(--border)", marginTop: "1rem" }}>
            <a 
              href="https://blkautomation.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: "0.7rem", color: "var(--muted)", textDecoration: "none", display: "block" }}
            >
              Built by <span style={{ color: "var(--primary)" }}>BlkAutomation.uk</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {[
          { name: "Dash", path: "/dashboard", icon: "📊" },
          { name: "History", path: "/dashboard/transactions", icon: "⌛" },
          { name: "Accounts", path: "/dashboard/accounts", icon: "💳" },
          { name: "Budgets", path: "/dashboard/budgets", icon: "💰" },
          { name: "Profile", path: "/dashboard/profile", icon: "👤" },
        ].map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
