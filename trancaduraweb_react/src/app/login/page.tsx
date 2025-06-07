"use client";

import { useEffect } from "react";
import LoginForm from "@/components/Forms/LoginForm";

export default function LoginPage() {
  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background =
      "linear-gradient(120deg,rgba(5, 175, 242, 1) 33%, rgba(35, 224, 108, 1) 71%, rgba(46, 242, 59, 1) 100%)";

    return () => {
      document.body.style.background = original;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-background w-full max-w-xs sm:max-w-lg md:max-w-xl p-8 rounded-lg shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
}
