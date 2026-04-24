import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Users, 
  MessageCircle, 
  Radio, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Gamepad2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/40">
              <GraduationCap className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">UniConnect</span>
          </div>
          <Link 
            to="/login" 
            className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-emerald-50 active:scale-95"
          >
            Giriş et
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
            <Zap className="h-3 w-3" />
            <span>Azərbaycan tələbələri üçün ilk platforma</span>
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Universitet həyatını <br />
            <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
              daha maraqlı et.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Dostlar tap, anonim söhbət et, məktublar göndər və kampus həyatının nəbzini tut. 
            UniConnect səni digər tələbələrlə birləşdirir.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-slate-950 transition hover:bg-emerald-400 sm:w-auto active:scale-95"
            >
              İndi başla
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 px-8 py-4 text-lg font-bold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              Xüsusiyyətlər
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Platformada səni nə gözləyir?</h2>
            <p className="mt-4 text-slate-400">Tələbələr üçün hazırlanmış özəl funksiyalar</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition hover:border-emerald-500/30 hover:bg-slate-900/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30 transition group-hover:scale-110">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Tələbə Kəşfi</h3>
              <p className="text-slate-400">
                Universitet, ixtisas və maraqlarına uyğun yeni insanlarla kommunikasiya qur, şəbəkəni genişləndir
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition hover:border-violet-500/30 hover:bg-slate-900/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/30 transition group-hover:scale-110">
                <Radio className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Kampus Frekansı</h3>
              <p className="text-slate-400">
                Öz universitetinin anonim çat otağına qoşul, canlı müzakirələrdə iştirak et
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition hover:border-blue-500/30 hover:bg-slate-900/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/30 transition group-hover:scale-110">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Məktublar</h3>
              <p className="text-slate-400">
                Təsadüfi tələbələrə maraqlı məktublar göndər və onlardan cavablar al
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition hover:border-amber-500/30 hover:bg-slate-900/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30 transition group-hover:scale-110">
                <MessageCircle className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Real-time Çat</h3>
              <p className="text-slate-400">
                Dostlarınla anlıq və təhlükəsiz şəkildə mesajlaş, fayllarını paylaş
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition hover:border-pink-500/30 hover:bg-slate-900/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 ring-1 ring-pink-500/30 transition group-hover:scale-110">
                <Gamepad2 className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Oyunlar və Puzzle</h3>
              <p className="text-slate-400">
                Gündəlik tapmacaları həll et, rəqiblərinlə yarış və liderlər sırasına yüksəl
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition hover:border-emerald-500/30 hover:bg-slate-900/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30 transition group-hover:scale-110">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Təhlükəsizlik</h3>
              <p className="text-slate-400">
                Yalnız .edu.az e-poçtları ilə təsdiqlənmiş real tələbə profilləri
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950/30">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <GraduationCap className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-bold tracking-tight">UniConnect</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 UniConnect. Bütün hüquqlar qorunur. <br />
            Azərbaycan tələbələri tərəfindən sevgi ilə yaradıldı.
          </p>
        </div>
      </footer>
    </div>
  );
}
