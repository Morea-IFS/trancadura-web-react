"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import axios from "axios";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // Chama o endpoint de logout do backend
    axios
      .post(
        "http://localhost:8080/api/auth/logout",
        {},
        { withCredentials: true }
      )
      .finally(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className="text-6xl text-black">Saindo...</h1>
    </div>
  );
}
