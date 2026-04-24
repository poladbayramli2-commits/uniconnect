import { useState } from "react";
import { GraduationCap, Loader2, Mail, Check, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { UNIVERSITIES, HOBBY_SUGGESTIONS } from "../constants/universities.js";

export default function Login() {
  const { signInGoogle, registerEmail, loginEmail, firebaseReady } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Yeni sahələr
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [major, setMajor] = useState("");
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [customHobby, setCustomHobby] = useState("");
  const [showCustomHobby, setShowCustomHobby] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggleHobby = (hobby) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  const addCustomHobbyAction = () => {
    const trimmed = customHobby.trim();
    if (trimmed && !selectedHobbies.includes(trimmed)) {
      setSelectedHobbies([...selectedHobbies, trimmed]);
      setCustomHobby("");
    }
  };

  async function onGoogle() {
    setError("");
    setBusy(true);
    try {
      await signInGoogle();
    } catch (e) {
      setError(e?.message || "Google girişi alınmadı.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        await registerEmail(email, password, name, {
          university,
          course: course ? parseInt(course) : null,
          major,
          hobbies: selectedHobbies
        });
      } else {
        await loginEmail(email, password);
      }
    } catch (err) {
      setError(err?.message || "Əməliyyat alınmadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-4 py-10">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/40">
          <GraduationCap className="h-8 w-8 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          UniConnect
        </h1>
        <p className="text-sm text-slate-400">
          Universitetdə yeni dostlar və ortaq maraqlar kəşf et.
        </p>
        <p className="mx-auto max-w-xs text-[11px] text-slate-500">
          UNEC / .edu.az üçün: e-poçt və şifrə ilə qeydiyyat və ya giriş. Gmail
          istifadə edirsinizsə: «Google ilə davam et».
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-emerald-500/5">
        {!firebaseReady && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            Giriş üçün Firebase konfiqurasiyası lazımdır. Brauzerin konsolunda
            xəbərdarlıq və ya yuxarıdakı sarı bannerə baxın.
          </p>
        )}
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy || !firebaseReady}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:border-slate-500 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4 text-slate-300" />
          )}
          Google ilə davam et
        </button>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          və ya e-poçt
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3" aria-disabled={!firebaseReady}>
          {mode === "register" && (
            <>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Ad Soyad
                </label>
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-emerald-500/40 focus:border-emerald-500/60 focus:ring"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Məs: Leyla Məmmədova"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Universitet
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-emerald-500/40 focus:border-emerald-500/60 focus:ring"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                  >
                    <option value="">Seçin</option>
                    {UNIVERSITIES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Kurs
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-emerald-500/40 focus:border-emerald-500/60 focus:ring"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                  >
                    <option value="">Seçin</option>
                    {[1, 2, 3, 4, 5].map((c) => (
                      <option key={c} value={c}>
                        {c}-{c === 3 || c === 4 ? "cü" : "ci"} kurs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  İxtisas
                </label>
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-emerald-500/40 focus:border-emerald-500/60 focus:ring"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Məs: İnformasiya Texnologiyaları"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  Maraqlar (Hobbilər)
                </label>
                
                {/* Seçilmiş Maraqlar */}
                {selectedHobbies.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedHobbies.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleHobby(h)}
                        className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/40 hover:bg-emerald-500/30"
                      >
                        {h} <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {HOBBY_SUGGESTIONS.filter(h => !selectedHobbies.includes(h)).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHobby(h)}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-600 hover:text-white"
                    >
                      {h}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomHobby(!showCustomHobby)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      showCustomHobby
                        ? "border-violet-500/60 bg-violet-500/10 text-violet-200"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    + Digər
                  </button>
                </div>
                
                {showCustomHobby && (
                  <div className="mt-3 flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none ring-violet-500/40 focus:border-violet-500/60 focus:ring"
                      value={customHobby}
                      onChange={(e) => setCustomHobby(e.target.value)}
                      placeholder="Öz marağını yaz..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomHobbyAction();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomHobbyAction}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white transition hover:bg-violet-400 active:scale-95"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-xs text-slate-400">E-poçt</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-emerald-500/40 focus:border-emerald-500/60 focus:ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ad@universitet.edu.az"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              `.edu.az` ünvanı avtomatik &quot;Təsdiqlənmiş Tələbə&quot; nişanı
              verir.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Şifrə</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-emerald-500/40 focus:border-emerald-500/60 focus:ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          {error && (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !firebaseReady}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "register" ? "Hesab yarat" : "Daxil ol"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full text-center text-xs text-slate-400 underline-offset-2 hover:text-white hover:underline"
        >
          {mode === "login"
            ? "Hesabın yoxdur? Qeydiyyat"
            : "Artıq hesabın var? Giriş"}
        </button>
      </div>
    </div>
  );
}
