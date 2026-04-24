import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Compass,
  Gamepad2,
  Mail,
  MessageCircle,
  Radio,
  Shield,
  User,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiService } from "../services/ApiService.js";

const sidebarLinkClass =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition-all hover:bg-slate-800/50 hover:text-white";
const sidebarActiveClass =
  "bg-gradient-to-r from-emerald-500/20 to-violet-500/10 text-emerald-300 ring-1 ring-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]";

export function Layout({ children }) {
  const { isAdmin, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Menyu açıldıqda səhifənin sürüşməsini dayandırır
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSidebarOpen]);

  // Route dəyişdikdə menyunu bağlayır
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    async function loadBadges() {
      try {
        const [pendingRes, unreadRes] = await Promise.all([
          ApiService.friends.pending(user.uid),
          ApiService.messages.unread(user.uid),
        ]);

        if (!cancelled) {
          if (pendingRes?.success) {
            const inbound = (pendingRes.data || []).filter(
              (e) => e.senderId !== user.uid,
            );
            setPendingCount(inbound.length);
          }
          if (unreadRes?.success) {
            setUnreadCount(unreadRes.data?.total || 0);
          }
        }
      } catch {
        if (!cancelled) {
          setPendingCount(0);
          setUnreadCount(0);
        }
      }
    }

    loadBadges();
    const t = setInterval(loadBadges, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user]);

  function Badge({ count }) {
    if (!count) return null;
    const text = count > 99 ? "99+" : String(count);
    return (
      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white ring-2 ring-slate-950">
        {text}
      </span>
    );
  }

  const navItems = [
    { to: "/explore", label: "Explore", icon: Compass },
    { to: "/frekans", label: "Frekans", icon: Radio },
    { to: "/mektublar", label: "Məktublar", icon: Mail },
    { to: "/oyunlar", label: "Oyunlar", icon: Gamepad2 },
    { to: "/chat", label: "Çat", icon: MessageCircle },
    { to: "/notifications", label: "Bildirişlər", icon: Bell },
    { to: "/profile", label: "Profil", icon: User },
  ];

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black sm:max-w-4xl lg:max-w-6xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-500/10 to-transparent" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 transition-all hover:bg-slate-800 hover:text-emerald-400 active:scale-95"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link to="/" className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400/90">
                UniConnect
              </p>
              <p className="text-sm font-medium text-slate-300">
                Kampus · dostluq · oyun
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/25 sm:inline-flex"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

            <Link
              to="/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 transition-all hover:bg-slate-800 hover:text-emerald-400 active:scale-95"
              title="Bildirişlər"
            >
              <Bell className="h-5 w-5" />
              <Badge count={pendingCount} />
            </Link>

            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 transition-all hover:bg-slate-800 hover:text-emerald-400 active:scale-95"
              title="Profil"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-0 flex-1 px-4 py-4">{children}</main>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 z-[60] h-full w-[280px] transform border-r border-slate-800/50 bg-slate-950/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out sm:w-[320px] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Menyu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/50 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${sidebarLinkClass} ${isActive ? sidebarActiveClass : ""}`
                }
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.to === "/notifications" && <Badge count={pendingCount} />}
                  {item.to === "/chat" && <Badge count={unreadCount} />}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.to === "/notifications" && pendingCount > 0 && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-200 ring-1 ring-rose-500/30">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
                {item.to === "/chat" && unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-200 ring-1 ring-rose-500/30">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${sidebarLinkClass} mt-4 border-t border-slate-800 pt-6 ${
                    isActive ? sidebarActiveClass : ""
                  }`
                }
              >
                <Shield className="h-5 w-5 text-amber-500" />
                Admin Paneli
              </NavLink>
            )}
          </nav>

          <div className="mt-auto border-t border-slate-800/50 pt-6 pr-8 text-right">
            <p className="text-xs text-slate-500">UniConnect v1.2.0</p>
            {/* 'Activate Windows' üçün boşluq tənzimləməsi */}
            <div className="h-12" />
          </div>
        </div>
      </aside>
    </div>
  );
}
