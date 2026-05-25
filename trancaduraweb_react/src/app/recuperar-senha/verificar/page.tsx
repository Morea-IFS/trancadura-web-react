"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IoKeyOutline, IoArrowBack, IoRefresh } from "react-icons/io5";
import api from "@/lib/api";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // segundos

export default function VerificarCodigoPage() {
  const router = useRouter();

  // Código OTP — array de 6 dígitos
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Estados
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Contador regressivo de expiração (15 min = 900s)
  const [expireSeconds, setExpireSeconds] = useState(900);
  const [expired, setExpired] = useState(false);

  // Cooldown de reenvio
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Recupera o email salvo
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email");
    if (!savedEmail) {
      router.replace("/recuperar-senha");
      return;
    }
    setEmail(savedEmail);
    inputRefs.current[0]?.focus();
  }, [router]);

  // Contador de expiração
  useEffect(() => {
    if (expired) return;
    const timer = setInterval(() => {
      setExpireSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expired]);

  // Cooldown do botão Reenviar
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Manipula digitação em cada campo
  const handleChange = (index: number, value: string) => {
    // Aceita apenas dígitos
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    // Auto-advance
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quando o último dígito é preenchido
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newDigits.join("");
      if (fullCode.length === CODE_LENGTH) {
        submitCode(newDigits);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Limpa o dígito atual
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        // Volta para o campo anterior
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  // Suporte a colar o código inteiro
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newDigits = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const lastFilled = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === CODE_LENGTH) {
      submitCode(newDigits);
    }
  };

  const submitCode = useCallback(async (codeDigits: string[]) => {
    const code = codeDigits.join("");
    if (code.length !== CODE_LENGTH) return;
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-reset-code", { email, code });
      const { resetToken } = res.data;
      sessionStorage.setItem("reset_token", resetToken);
      router.push("/recuperar-senha/nova-senha");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Código inválido ou expirado.";
      setError(msg);
      // Limpa os campos ao errar
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResending(true);
    setResendSuccess(false);
    try {
      await api.post("/auth/forgot-password", { email });
      setExpireSeconds(900);
      setExpired(false);
      setResendCooldown(RESEND_COOLDOWN);
      setDigits(Array(CODE_LENGTH).fill(""));
      setError("");
      setResendSuccess(true);
      setTimeout(() => { setResendSuccess(false); inputRefs.current[0]?.focus(); }, 2000);
    } catch {
      setError("Erro ao reenviar. Tente novamente.");
    } finally {
      setResending(false);
    }
  };

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-login">
      <div className="bg-white w-full max-w-xs sm:max-w-md p-8 rounded-2xl shadow-xl my-4">

        {/* Ícone */}
        <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-5 flex items-center justify-center">
          <IoKeyOutline className="w-10 h-10 text-white" />
        </div>

        {/* Títulos */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Verificar Código</h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Enviamos um código de 6 dígitos para
          </p>
          <p className="font-semibold text-gray-700 text-sm truncate">{email}</p>
        </div>

        {/* Contador de expiração */}
        <div className={`flex items-center justify-center gap-1.5 mt-3 mb-6 text-sm font-medium ${expired ? "text-red-500" : "text-gray-500"}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${expired ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
          {expired ? "Código expirado" : `Expira em ${formatTime(expireSeconds)}`}
        </div>

        {/* Feedback de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-5 text-center">
            {error}
          </div>
        )}

        {/* Feedback de reenvio bem-sucedido */}
        {resendSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 text-sm mb-5 text-center">
            Novo código enviado! ✅
          </div>
        )}

        {/* Inputs OTP */}
        <div
          className="flex justify-center gap-2 sm:gap-3 mb-6"
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              id={`otp-digit-${i}`}
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading || expired}
              className={`
                w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 outline-none
                transition-all duration-150 caret-transparent
                ${digit ? "border-primary text-primary bg-blue-50" : "border-gray-300 text-gray-800"}
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
                ${expired ? "opacity-40 cursor-not-allowed" : "focus:border-primary focus:ring-2 focus:ring-blue-100"}
              `}
            />
          ))}
        </div>

        {/* Botão confirmar (para quando o auto-submit não disparar) */}
        {!expired && (
          <button
            id="confirm-code-btn"
            onClick={() => submitCode(digits)}
            disabled={!isComplete || loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              "Confirmar Código"
            )}
          </button>
        )}

        {/* Reenviar código */}
        <button
          id="resend-code-btn"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition mx-auto w-full"
        >
          <IoRefresh className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
          {resendCooldown > 0
            ? `Reenviar em ${resendCooldown}s`
            : resending
            ? "Reenviando..."
            : "Reenviar código"}
        </button>

        {/* Voltar */}
        <button
          id="back-to-email-btn"
          onClick={() => router.push("/recuperar-senha")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mx-auto mt-5 transition"
        >
          <IoArrowBack className="w-4 h-4" />
          Voltar
        </button>
      </div>
    </div>
  );
}
