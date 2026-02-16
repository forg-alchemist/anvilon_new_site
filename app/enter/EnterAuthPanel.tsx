"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  isEn: boolean;
  backgroundUrl: string;
  backLabel: string;
};

type FlashToast = {
  kind: "success" | "error";
  message: string;
  key: number;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REMEMBER_KEY = "anvilon.auth.remember";
const SAVED_LOGIN_KEY = "anvilon.auth.saved_login";

export default function EnterAuthPanel({ isEn, backgroundUrl, backLabel }: Props) {
  const router = useRouter();
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerLogin, setRegisterLogin] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(true);

  const [flashToast, setFlashToast] = useState<FlashToast | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const loginError = submitted && !loginValue.trim();
  const passwordError = submitted && !passwordValue.trim();
  const hasErrors = loginError || passwordError;

  const registerEmailError = registerSubmitted && !registerEmail.trim();
  const registerEmailFormatError =
    registerSubmitted && !!registerEmail.trim() && !EMAIL_REGEX.test(registerEmail.trim());
  const registerLoginError = registerSubmitted && !registerLogin.trim();
  const registerPasswordError = registerSubmitted && !registerPassword.trim();

  const labels = useMemo(
    () => ({
      login: isEn ? "Login or E-mail" : "Логин или e-mail",
      password: isEn ? "Password" : "Пароль",
      enter: isEn ? "Sign in" : "Войти",
      register: isEn ? "Registration" : "Регистрация",
      required: isEn ? "Required field" : "Обязательное поле",
      invalidEmail: isEn ? "Enter a valid e-mail" : "Введите корректную почту",
      registerTitle: isEn ? "Create account" : "Регистрация",
      email: isEn ? "E-mail" : "Почта",
      registerLogin: isEn ? "Login" : "Логин",
      registerPassword: isEn ? "Password" : "Пароль",
      registerSubmit: isEn ? "Sign up" : "Зарегистрироваться",
      close: isEn ? "Close" : "Закрыть",
      registrationSuccess: isEn ? "Registration successful" : "Регистрация успешна",
      genericError: isEn ? "Error" : "Ошибка",
      loginSuccess: isEn ? "Login successful" : "Вход выполнен",
      userNotFound: isEn ? "User not found" : "Пользователь не найден",
      rememberLogin: isEn ? "Remember me" : "Запомнить меня",
    }),
    [isEn]
  );

  useEffect(() => {
    try {
      const rememberStored = window.localStorage.getItem(REMEMBER_KEY);
      const shouldRemember = rememberStored !== "0";
      setRememberCredentials(shouldRemember);

      if (!shouldRemember) {
        return;
      }

      const savedLogin = window.localStorage.getItem(SAVED_LOGIN_KEY) ?? "";
      if (savedLogin) {
        setLoginValue(savedLogin);
      }
    } catch {
      // Ignore storage errors and keep default state.
    }
  }, []);

  useEffect(() => {
    try {
      if (rememberCredentials) {
        window.localStorage.setItem(REMEMBER_KEY, "1");
        return;
      }

      window.localStorage.setItem(REMEMBER_KEY, "0");
      window.localStorage.removeItem(SAVED_LOGIN_KEY);
    } catch {
      // Ignore storage errors and continue with in-memory state.
    }
  }, [rememberCredentials]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (kind: FlashToast["kind"], message: string) => {
    setFlashToast({ kind, message, key: Date.now() });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setFlashToast(null);
    }, 3000);
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    const identifier = loginValue.trim();
    const password = passwordValue.trim();
    if (!identifier || !password) return;

    try {
      let emailToUse = identifier;

      if (!identifier.includes("@")) {
        const { data, error } = await supabase
          .schema("account")
          .from("user_login")
          .select("email")
          .eq("username", identifier)
          .maybeSingle();

        if (error || !data?.email) {
          showToast("error", labels.userNotFound);
          return;
        }

        emailToUse = data.email;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (signInError) {
        showToast("error", signInError.message || labels.userNotFound);
        return;
      }

      const { data: me, error: meError } = await supabase.auth.getUser();
      if (meError || !me.user) {
        showToast("error", meError?.message || labels.userNotFound);
        return;
      }

      try {
        if (rememberCredentials) {
          window.localStorage.setItem(REMEMBER_KEY, "1");
          window.localStorage.setItem(SAVED_LOGIN_KEY, identifier);
        } else {
          window.localStorage.setItem(REMEMBER_KEY, "0");
          window.localStorage.removeItem(SAVED_LOGIN_KEY);
        }
      } catch {
        // Ignore storage errors and keep login flow successful.
      }

      router.replace("/enter/account");
    } catch {
      showToast("error", labels.genericError);
    }
  };

  const openRegistration = () => {
    setRegisterSubmitted(false);
    setIsRegisterOpen(true);
  };

  const handleRegistration = async (event: FormEvent) => {
    event.preventDefault();
    setRegisterSubmitted(true);

    const email = registerEmail.trim().toLowerCase();
    const username = registerLogin.trim();
    const password = registerPassword.trim();

    if (!email || !username || !password || !EMAIL_REGEX.test(email)) return;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data.user?.id) {
        showToast("error", error?.message || labels.genericError);
        return;
      }

      const { error: profileError } = await supabase
        .schema("account")
        .from("user_login")
        .upsert(
          {
            user_id: data.user.id,
            username,
            email,
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        showToast("error", profileError.message || labels.genericError);
        return;
      }

      const { data: insertedRow, error: verifyError } = await supabase
        .schema("account")
        .from("user_login")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (verifyError || !insertedRow?.user_id) {
        showToast("error", verifyError?.message || labels.genericError);
        return;
      }

      showToast("success", labels.registrationSuccess);
      setIsRegisterOpen(false);
      setRegisterSubmitted(false);
      setRegisterEmail("");
      setRegisterLogin("");
      setRegisterPassword("");
      setLoginValue(username);
      setPasswordValue(password);
    } catch {
      showToast("error", labels.genericError);
    }
  };

  const inputBase =
    "h-12 w-full rounded-xl border bg-black/35 px-4 text-base text-white outline-none transition placeholder:text-white/50";

  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-3 z-40 inline-flex h-11 items-center gap-2 rounded-xl border px-4 transition"
        style={{
          borderColor: "rgba(244, 214, 123, 0.34)",
          background:
            "radial-gradient(120% 150% at 15% 0%, rgba(244,214,123,0.14), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(20,26,44,0.86), rgba(8,12,22,0.88))",
          boxShadow: "0 10px 26px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
          color: "rgba(244, 228, 186, 0.95)",
          textDecoration: "none",
          fontFamily: "var(--font-buttons)",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, transform: "translateY(-1px)" }}>
          ←
        </span>
        <span>{backLabel}</span>
      </Link>

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundColor: "#090f1d",
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 70% at 50% 45%, rgba(8,18,42,0.10), rgba(8,18,42,0.58) 85%), linear-gradient(180deg, rgba(5,10,20,0.40), rgba(5,10,20,0.54))",
        }}
      />

      <div className="relative z-10 flex min-h-[72vh] items-center justify-center px-4 py-10">
        <form
          onSubmit={handleLogin}
          autoComplete="on"
          method="post"
          className="w-full max-w-[420px] rounded-3xl border border-[#e7c47a]/35 bg-black/42 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md sm:p-8"
        >
          <div className="space-y-4">
            <div>
              <input
                id="auth-username"
                name="username"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder={labels.login}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className={`${inputBase} ${loginError ? "border-red-500/90 shadow-[0_0_0_1px_rgba(239,68,68,0.65)]" : "border-white/15 focus:border-[#e7c47a]/75 focus:shadow-[0_0_0_1px_rgba(231,196,122,0.55)]"}`}
              />
              {loginError ? <p className="mt-1 text-sm text-red-300">{labels.required}</p> : null}
            </div>

            <div>
              <input
                type="password"
                id="auth-password"
                name="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder={labels.password}
                autoComplete="current-password"
                required
                className={`${inputBase} ${passwordError ? "border-red-500/90 shadow-[0_0_0_1px_rgba(239,68,68,0.65)]" : "border-white/15 focus:border-[#e7c47a]/75 focus:shadow-[0_0_0_1px_rgba(231,196,122,0.55)]"}`}
              />
              {passwordError ? <p className="mt-1 text-sm text-red-300">{labels.required}</p> : null}
            </div>
          </div>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={rememberCredentials}
              onChange={(e) => setRememberCredentials(e.target.checked)}
              className="h-4 w-4 rounded border border-[#e7c47a]/50 bg-transparent accent-[#e7c47a]"
            />
            <span>{labels.rememberLogin}</span>
          </label>

          <button
            type="submit"
            className="mt-4 h-12 w-full rounded-xl border border-[#e7c47a]/50 bg-[linear-gradient(180deg,rgba(231,196,122,0.30),rgba(231,196,122,0.08))] text-[15px] font-semibold uppercase tracking-[0.14em] text-[#f4ddb1] transition hover:border-[#e7c47a]/80 hover:shadow-[0_0_24px_rgba(231,196,122,0.28)] active:translate-y-px"
          >
            {labels.enter}
          </button>

          <button
            type="button"
            onClick={openRegistration}
            className="mt-3 h-11 w-full rounded-xl border border-[#7dc8ff]/40 bg-[linear-gradient(180deg,rgba(125,200,255,0.25),rgba(125,200,255,0.06))] text-[14px] font-semibold uppercase tracking-[0.12em] text-[#d9eeff] transition hover:border-[#7dc8ff]/80 hover:shadow-[0_0_22px_rgba(125,200,255,0.26)] active:translate-y-px"
          >
            {labels.register}
          </button>

          {hasErrors ? <p className="mt-3 text-sm text-red-300">{labels.required}</p> : null}
        </form>
      </div>

      {isRegisterOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label={labels.close}
            onClick={() => setIsRegisterOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
          />

          <form
            onSubmit={handleRegistration}
            autoComplete="on"
            method="post"
            className="relative z-10 w-full max-w-[440px] rounded-3xl border border-[#7dc8ff]/40 bg-[#060b18]/90 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.65)] backdrop-blur-lg sm:p-8"
          >
            <button
              type="button"
              aria-label={labels.close}
              onClick={() => setIsRegisterOpen(false)}
              className="absolute right-3 top-3 h-8 w-8 rounded-full border border-white/20 text-white/75 transition hover:border-white/45 hover:text-white"
            >
              ×
            </button>

            <h2
              className="mb-5 text-center uppercase"
              style={{
                fontFamily: "var(--font-buttons)",
                fontSize: 20,
                letterSpacing: "0.1em",
                color: "rgba(232, 240, 255, 0.95)",
              }}
            >
              {labels.registerTitle}
            </h2>

            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder={labels.email}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  className={`${inputBase} ${registerEmailError || registerEmailFormatError ? "border-red-500/90 shadow-[0_0_0_1px_rgba(239,68,68,0.65)]" : "border-white/15 focus:border-[#7dc8ff]/75 focus:shadow-[0_0_0_1px_rgba(125,200,255,0.55)]"}`}
                />
                {registerEmailError ? <p className="mt-1 text-sm text-red-300">{labels.required}</p> : null}
                {!registerEmailError && registerEmailFormatError ? (
                  <p className="mt-1 text-sm text-red-300">{labels.invalidEmail}</p>
                ) : null}
              </div>

              <div>
                <input
                  id="register-username"
                  name="username"
                  value={registerLogin}
                  onChange={(e) => setRegisterLogin(e.target.value)}
                  placeholder={labels.registerLogin}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  className={`${inputBase} ${registerLoginError ? "border-red-500/90 shadow-[0_0_0_1px_rgba(239,68,68,0.65)]" : "border-white/15 focus:border-[#7dc8ff]/75 focus:shadow-[0_0_0_1px_rgba(125,200,255,0.55)]"}`}
                />
                {registerLoginError ? <p className="mt-1 text-sm text-red-300">{labels.required}</p> : null}
              </div>

              <div>
                <input
                  type="password"
                  id="register-password"
                  name="new-password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder={labels.registerPassword}
                  autoComplete="new-password"
                  required
                  className={`${inputBase} ${registerPasswordError ? "border-red-500/90 shadow-[0_0_0_1px_rgba(239,68,68,0.65)]" : "border-white/15 focus:border-[#7dc8ff]/75 focus:shadow-[0_0_0_1px_rgba(125,200,255,0.55)]"}`}
                />
                {registerPasswordError ? <p className="mt-1 text-sm text-red-300">{labels.required}</p> : null}
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 h-12 w-full rounded-xl border border-[#7dc8ff]/55 bg-[linear-gradient(180deg,rgba(125,200,255,0.32),rgba(125,200,255,0.08))] text-[14px] font-semibold uppercase tracking-[0.12em] text-[#e3f2ff] transition hover:border-[#7dc8ff]/90 hover:shadow-[0_0_24px_rgba(125,200,255,0.32)] active:translate-y-px"
            >
              {labels.registerSubmit}
            </button>
          </form>
        </div>
      ) : null}

      {flashToast ? (
        <div
          key={flashToast.key}
          className={`auth-toast fixed right-5 top-16 z-[1200] rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${
            flashToast.kind === "success"
              ? "border-emerald-400/45 bg-emerald-500/20 text-emerald-100"
              : "border-rose-400/45 bg-rose-500/20 text-rose-100"
          }`}
        >
          {flashToast.message}
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes auth-toast-fade {
          0% {
            opacity: 0;
          }
          16.666% {
            opacity: 1;
          }
          83.333% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        .auth-toast {
          animation: auth-toast-fade 3s ease-in-out both;
        }
      `}</style>
    </>
  );
}

