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
    
    // Əgər ad yoxdursa, u.displayName-dən götür
    let fName = partial.firstName || "";
    let lName = partial.lastName || "";
    if (!fName && !lName && u.displayName) {
      const parts = u.displayName.trim().split(/\s+/);
      fName = parts[0] || "";
      lName = parts.slice(1).join(" ") || "";
    }

    const base = {
      email,
      verifiedStudent,
      photoURL: u.photoURL || u.photoURL || "",
      updatedAt: serverTimestamp(),
    };

    try {
      // MongoDB-yə qeydiyyat/yeniləmə sorğusu göndər
      const res = await ApiService.users.register({
        uid: u.uid,
        email,
        firstName: fName,
        lastName: lName,
        photoURL: u.photoURL || ""
      });

      if (res.success) {
        // Əgər əlavə məlumatlar varsa, onları da yenilə
        if (Object.keys(partial).length > 0) {
          const updateRes = await ApiService.users.updateProfile(u.uid, partial);
          if (updateRes.success) {
            setProfile(updateRes.data);
          }
        } else {
          setProfile(res.data);
        }
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

  async function registerEmail(email, password, displayName) {
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
      await upsertUserDocument(cred.user, { firstName, lastName });
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
    const ref = doc(firebase.db, COL.USERS, u.uid);
    const snap = await getDocWithRetry(firebase.db, ref);
    if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
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
