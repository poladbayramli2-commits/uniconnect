import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { firebase, firebaseReady } from "../firebase.js";
import { COL } from "../models/firestorePaths.js";
import { getDocWithRetry } from "../utils/firestoreRetry.js";
import { humanizeFirebaseError } from "../utils/firebaseErrors.js";
import { isAdminEmail } from "../config/admin.js";
import { isVerifiedStudentEmail } from "../utils/student.js";
import { ApiService } from "../services/ApiService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady || !firebase) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    return onAuthStateChanged(firebase.auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      try {
        // Profil məlumatlarını MongoDB-dən gətir
        const res = await ApiService.users.getProfile(u.uid);
        if (res.success) {
          setProfile(res.data);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("[UniConnect] MongoDB profil oxunmadı:", e?.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function upsertUserDocument(u, partial = {}) {
    if (!firebaseReady || !firebase) {
      throw new Error("Firebase təyin edilməyib (.env).");
    }
    const email = u.email || "";
    const verifiedStudent = isVerifiedStudentEmail(email);
    const ref = doc(firebase.db, COL.USERS, u.uid);
    const existing = await getDocWithRetry(firebase.db, ref);
    
    // Yalnız data varsa göndər
    const registerData = {
      uid: u.uid,
      email,
    };

    if (partial.firstName) registerData.firstName = partial.firstName;
    if (partial.lastName) registerData.lastName = partial.lastName;
    if (u.photoURL) registerData.photoURL = u.photoURL;

    // Əgər adlar hələ də yoxdursa və u.displayName varsa
    if (!registerData.firstName && !registerData.lastName && u.displayName) {
      const parts = u.displayName.trim().split(/\s+/);
      registerData.firstName = parts[0] || "";
      registerData.lastName = parts.slice(1).join(" ") || "";
    }

    try {
      // MongoDB-yə qeydiyyat/yeniləmə sorğusu göndər
      console.log("[AuthContext] Registering user in MongoDB:", registerData);
      const res = await ApiService.users.register(registerData);

      if (res.success) {
        setProfile(res.data);
        console.log("[AuthContext] MongoDB istifadəçi sənədi sinxronizasiya edildi.");
      }
    } catch (err) {
      console.error("[AuthContext] MongoDB-yə yazmaq alınmadı:", err);
    }
  }

  async function signInGoogle() {
    if (!firebaseReady || !firebase) {
      throw new Error("Firebase təyin edilməyib (.env).");
    }
    const cred = await signInWithPopup(
      firebase.auth,
      firebase.googleProvider,
    ).catch((e) => {
      throw new Error(humanizeFirebaseError(e));
    });
    await upsertUserDocument(cred.user).catch((e) => {
      throw new Error(humanizeFirebaseError(e));
    });
    return cred.user;
  }

  async function registerEmail(email, password, displayName, extraData = {}) {
    if (!firebaseReady || !firebase) {
      throw new Error("Firebase təyin edilməyib (.env).");
    }
    const emailNorm = String(email || "").trim();
    const cred = await createUserWithEmailAndPassword(
      firebase.auth,
      emailNorm,
      password,
    ).catch((e) => {
      throw new Error(humanizeFirebaseError(e));
    });

    try {
      if (displayName?.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      const parts = (displayName || "").trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      await upsertUserDocument(cred.user, { firstName, lastName, ...extraData });
    } catch (e) {
      try {
        await signOut(firebase.auth);
      } catch {
        /* ignore */
      }
      const hint = humanizeFirebaseError(e);
      throw new Error(
        `${hint} Əgər e-poçt artıq qeydiyyatdan keçibsə, «Giriş» ilə daxil olmağı sınayın.`,
      );
    }
    return cred.user;
  }

  async function loginEmail(email, password) {
    if (!firebaseReady || !firebase) {
      throw new Error("Firebase təyin edilməyib (.env).");
    }
    const emailNorm = String(email || "").trim();
    const cred = await signInWithEmailAndPassword(
      firebase.auth,
      emailNorm,
      password,
    ).catch((e) => {
      throw new Error(humanizeFirebaseError(e));
    });
    await upsertUserDocument(cred.user).catch((e) => {
      throw new Error(humanizeFirebaseError(e));
    });
    return cred.user;
  }

  async function logout() {
    if (!firebaseReady || !firebase) return;
    await signOut(firebase.auth);
  }

  async function refreshProfile() {
    if (!firebaseReady || !firebase) return;
    const u = firebase.auth.currentUser;
    if (!u) return;
    try {
      const res = await ApiService.users.getProfile(u.uid);
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("[AuthContext] Profil yenilənmədi:", err);
    }
  }

  const isAdmin = Boolean(user?.email && isAdminEmail(user.email));

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firebaseReady,
      isAdmin,
      signInGoogle,
      registerEmail,
      loginEmail,
      logout,
      upsertUserDocument,
      refreshProfile,
    }),
    [user, profile, loading, firebaseReady, isAdmin],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider daxilində istifadə olunmalıdır");
  return ctx;
}
