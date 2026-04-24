import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiService } from "../services/ApiService.js";
import { UserCheck, UserX, Bell, Loader2, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Notifications() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await ApiService.friends.pending(user.uid);
      if (res.success) {
        // Gələn istəkləri (senderId !== user.uid) göstər
        const inbound = res.data.filter(req => req.senderId !== user.uid);
        setPendingRequests(inbound);
      }
    } catch (err) {
      console.error("Bildirişlər yüklənərkən xəta:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(requestId, action) {
    setActionBusy(requestId);
    try {
      if (action === "accept") {
        await ApiService.friends.accept(requestId);
      } else {
        // Rədd etmək üçün hələ backend-də xüsusi endpoint yoxdursa belə qalır
        // Hazırda yalnız qəbul etməyi dəstəkləyirik
      }
      await loadNotifications();
    } catch (err) {
      console.error("Əməliyyat xətası:", err);
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Bildirişlər</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yüklənir…
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
              <p className="text-slate-500 text-sm">Hələ ki, yeni bildiriş yoxdur.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
              >
                <Link to={`/profile/${req.senderId}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-800 ring-1 ring-slate-700">
                    {req.sender?.photoURL ? (
                      <img src={req.sender.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 font-bold">
                        {req.sender?.firstName?.slice(0, 1) || <User className="h-5 w-5" />}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {req.sender?.firstName} {req.sender?.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Sənə dostluq istəyi göndərdi
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(req._id, "accept")}
                    disabled={actionBusy === req._id}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
                    title="Qəbul et"
                  >
                    {actionBusy === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
