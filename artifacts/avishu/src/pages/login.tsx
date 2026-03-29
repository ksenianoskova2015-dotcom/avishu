import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, Label } from "@/components/ui-elements";
import { saveToken } from "@/lib/auth-token";
import { motion } from "framer-motion";

export default function Login() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data: user, isLoading: isChecking } = useGetMe();

  if (!isChecking && user) {
    if (user.role === "client") setLocation("/client");
    else if (user.role === "franchise") setLocation("/franchise");
    else setLocation("/production");
    return null;
  }

  const loginMut = useLogin({
    mutation: {
      onSuccess: (data) => {
        saveToken(data.token);
        queryClient.setQueryData(["/api/auth/me"], data.user);
        if (data.user.role === "client") setLocation("/client");
        else if (data.user.role === "franchise") setLocation("/franchise");
        else setLocation("/production");
      },
      onError: (err: any) => {
        setError(err?.data?.error || err?.message || "Invalid credentials");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMut.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background lines */}
      <div className="absolute inset-0 pointer-events-none flex justify-center opacity-20">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-zinc-500 to-transparent mx-12" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-zinc-500 to-transparent mx-12" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl font-display tracking-[0.4em] ml-3 mb-4">AVISHU</h1>
          <p className="text-xs font-display tracking-[0.2em] text-zinc-500 uppercase">Fashion Franchise System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Password</Label>
            <Input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-display tracking-widest uppercase text-center border border-red-900/50 bg-red-950/20 p-3">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full mt-4" 
            isLoading={loginMut.isPending}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs font-display tracking-[0.1em] text-zinc-500 uppercase">
            Нет аккаунта?{" "}
            <a
              href="/register"
              onClick={(e) => { e.preventDefault(); setLocation("/register"); }}
              className="text-white hover:text-zinc-300 transition-colors"
            >
              Зарегистрироваться
            </a>
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-900">
          <p className="text-[10px] font-display text-zinc-500 mb-4 tracking-[0.15em] uppercase">Demo Credentials</p>
          <div className="space-y-3 text-xs font-mono text-zinc-400">
            <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900">
              <span className="text-white">client@avishu.com</span>
              <span className="opacity-50">client123</span>
            </div>
            <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900">
              <span className="text-white">franchise@avishu.com</span>
              <span className="opacity-50">franchise123</span>
            </div>
            <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900">
              <span className="text-white">production@avishu.com</span>
              <span className="opacity-50">production123</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
