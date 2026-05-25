"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoLockClosedOutline, IoArrowBack, IoEye, IoEyeOff, IoCheckmarkCircle } from "react-icons/io5";
import api from "@/lib/api";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "Mínimo 6 caracteres", ok: password.length >= 6 },
    { label: "Letra maiúscula", ok: /[A-Z]/.test(password) },
    { label: "Letra minúscula", ok: /[a-z]/.test(password) },
    { label: "Número", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Barra de progresso */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? "text-red-500" : score === 2 ? "text-orange-500" : score === 3 ? "text-yellow-600" : "text-green-600"}`}>
        {labels[score]}
      </p>
      <ul className="mt-2 space-y-1">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1.5 text-xs transition-colors ${c.ok ? "text-green-600" : "text-gray-400"}`}>
            <IoCheckmarkCircle className={`w-3.5 h-3.5 flex-shrink-0 ${c.ok ? "text-green-500" : "text-gray-300"}`} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NovaSenhaPage() {
  const router = useRouter();
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("reset_token");
    if (!token) {
      router.replace("/recuperar-senha");
      return;
    }
    setResetToken(token);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        resetToken,
        newPassword,
      });

      // Limpa os dados da sessão de recuperação
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_token");

      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao redefinir a senha. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-login">
        <div className="bg-white w-full max-w-xs sm:max-w-md p-8 rounded-2xl shadow-xl text-center">
          {/* Checkmark animado */}
          <div className="w-24 h-24 rounded-full bg-green-100 mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: 0,
                  animation: "draw 0.5s ease forwards",
                }}
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Senha Redefinida!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Sua senha foi atualizada com sucesso. Você já pode fazer login com a nova senha.
          </p>

          <button
            id="go-to-login-success-btn"
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  const passwordMatch = confirmPassword && newPassword === confirmPassword;
  const passwordMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-login">
      <div className="bg-white w-full max-w-xs sm:max-w-md p-8 rounded-2xl shadow-xl my-4">

        {/* Ícone */}
        <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-5 flex items-center justify-center">
          <IoLockClosedOutline className="w-10 h-10 text-white" />
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-800">Nova Senha</h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Crie uma senha forte para proteger sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Nova senha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nova senha
            </label>
            <div className="relative">
              <input
                id="new-password-input"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-gray-400"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
              </button>
            </div>
            <PasswordStrength password={newPassword} />
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="confirm-password-input"
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 pr-11 text-sm outline-none focus:ring-2 transition placeholder:text-gray-400
                  ${passwordMismatch
                    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                    : passwordMatch
                    ? "border-green-400 focus:ring-green-200 focus:border-green-400"
                    : "border-gray-300 focus:ring-primary focus:border-transparent"
                  }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirm ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
            )}
            {passwordMatch && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <IoCheckmarkCircle className="w-3.5 h-3.5" /> Senhas conferem
              </p>
            )}
          </div>

          <button
            id="reset-password-btn"
            type="submit"
            disabled={loading || !newPassword || !confirmPassword || passwordMismatch as boolean}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              "Redefinir Senha"
            )}
          </button>
        </form>

        <button
          id="back-to-verify-btn"
          onClick={() => router.push("/recuperar-senha/verificar")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mx-auto mt-6 transition"
        >
          <IoArrowBack className="w-4 h-4" />
          Voltar
        </button>
      </div>
    </div>
  );
}
