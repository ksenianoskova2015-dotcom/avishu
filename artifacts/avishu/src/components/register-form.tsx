import { useState } from "react";
import { useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { saveToken } from "@/lib/auth-token";
import { Button, Input, Label } from "@/components/ui-elements";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Role = "client" | "franchise" | "production";

interface FieldError {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

function validateForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  role: string
): FieldError {
  const errors: FieldError = {};
  if (!name.trim()) errors.name = "Full name is required";
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  if (!role) errors.role = "Please select a role";
  return errors;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "client", label: "Клиент" },
  { value: "franchise", label: "Франчайзи" },
  { value: "production", label: "Производство" },
];

export function RegisterForm() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const registerMut = useRegister({
    mutation: {
      onSuccess: (data) => {
        saveToken(data.token);
        queryClient.setQueryData(["/api/auth/me"], data.user);
        if (data.user.role === "client") setLocation("/client");
        else if (data.user.role === "franchise") setLocation("/franchise");
        else setLocation("/production");
      },
      onError: (err: any) => {
        setServerError(err?.data?.error || err?.message || "Registration failed. Please try again.");
      },
    },
  });

  const errors = validateForm(name, email, password, confirmPassword, role);
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors(validateForm(name, email, password, confirmPassword, role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true, role: true });
    const errs = validateForm(name, email, password, confirmPassword, role);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setServerError("");
    registerMut.mutate({
      data: { name, email, password, role: role as Role },
    });
  };

  const fieldClass = (field: keyof FieldError) =>
    cn(
      "flex h-14 w-full border-b bg-transparent px-0 py-2 text-base font-sans text-white transition-colors",
      "placeholder:text-zinc-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      touched[field] && fieldErrors[field]
        ? "border-red-600 focus-visible:border-red-500"
        : "border-zinc-800 focus-visible:border-white"
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-sm relative z-10"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display tracking-[0.4em] ml-3 mb-4">AVISHU</h1>
        <p className="text-xs font-display tracking-[0.2em] text-zinc-500 uppercase mb-3">
          Fashion Franchise System
        </p>
        <p className="text-sm font-display tracking-[0.15em] text-zinc-300 uppercase">
          Создать аккаунт
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* ФИО */}
        <div className="space-y-2">
          <Label htmlFor="reg-name">ФИО</Label>
          <input
            id="reg-name"
            type="text"
            placeholder="Введите ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            className={fieldClass("name")}
          />
          <FieldErrorMsg message={touched.name ? fieldErrors.name : undefined} />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <input
            id="reg-email"
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            className={fieldClass("email")}
          />
          <FieldErrorMsg message={touched.email ? fieldErrors.email : undefined} />
        </div>

        {/* Пароль */}
        <div className="space-y-2">
          <Label htmlFor="reg-password">Пароль</Label>
          <input
            id="reg-password"
            type="password"
            placeholder="Придумайте пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur("password")}
            className={fieldClass("password")}
          />
          <FieldErrorMsg message={touched.password ? fieldErrors.password : undefined} />
        </div>

        {/* Повтор пароля */}
        <div className="space-y-2">
          <Label htmlFor="reg-confirm">Повтор пароля</Label>
          <input
            id="reg-confirm"
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            className={fieldClass("confirmPassword")}
          />
          <FieldErrorMsg message={touched.confirmPassword ? fieldErrors.confirmPassword : undefined} />
        </div>

        {/* Роль */}
        <div className="space-y-2">
          <Label htmlFor="reg-role">Роль</Label>
          <div className="flex gap-2 pt-1">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setRole(opt.value);
                  setTouched((prev) => ({ ...prev, role: true }));
                }}
                className={cn(
                  "flex-1 h-11 border text-xs font-display tracking-[0.1em] uppercase transition-all duration-200",
                  role === opt.value
                    ? "border-white bg-white text-black"
                    : touched.role && fieldErrors.role
                    ? "border-red-800 text-zinc-400 hover:border-red-500"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-500"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <FieldErrorMsg message={touched.role ? fieldErrors.role : undefined} />
        </div>

        {/* Server error */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500 text-xs font-display tracking-widest uppercase text-center border border-red-900/50 bg-red-950/20 p-3"
            >
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={registerMut.isPending}
          disabled={registerMut.isPending}
        >
          Зарегистрироваться
        </Button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-xs font-display tracking-[0.1em] text-zinc-500 uppercase">
          Уже есть аккаунт?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              setLocation("/login");
            }}
            className="text-white hover:text-zinc-300 transition-colors"
          >
            Войти
          </a>
        </p>
      </div>
    </motion.div>
  );
}

function FieldErrorMsg({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-red-500 text-[10px] font-display tracking-[0.1em] uppercase mt-1"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
