import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { RegisterForm } from "@/components/register-form";

export default function Register() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();

  if (!isLoading && user) {
    if (user.role === "client") setLocation("/client");
    else if (user.role === "franchise") setLocation("/franchise");
    else setLocation("/production");
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none flex justify-center opacity-20">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-zinc-500 to-transparent mx-12" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-zinc-500 to-transparent mx-12" />
      </div>
      <RegisterForm />
    </div>
  );
}
