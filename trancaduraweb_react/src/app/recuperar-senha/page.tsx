"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoLockClosedOutline, IoMailOutline, IoArrowBack } from "react-icons/io5";
import api from "@/lib/api";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      // Salva o email na sessão para a próxima etapa
      sessionStorage.setItem("reset_email", email);
      setSent(true);
    } catch {
      setError("Erro ao processar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-login">
      <div className="bg-white w-full max-w-xs sm:max-w-lg md:max-w-xl p-8 rounded-2xl shadow-xl my-4">

        {/* Ícone e título */}
        <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-5 flex items-center justify-center">
          <IoMailOutline className="w-10 h-10 text-white" />
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {sent
              ? "Verifique seu email e insira o código que enviamos"
              : "Digite seu email e enviaremos um código de verificação"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email cadastrado
              </label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-gray-400"
              />
            </div>

            <button
              id="send-code-btn"
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Código"
              )}
            </button>
          </form>
        ) : (
          /* Feedback de sucesso */
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">Email enviado!</p>
              <p className="text-sm text-gray-500 mt-1">
                Se <span className="font-medium text-gray-700">{email}</span> estiver cadastrado, você receberá o código em instantes.
              </p>
              <p className="text-xs text-gray-400 mt-2">Verifique também a pasta de spam.</p>
            </div>

            {/* Aviso de spam destacado */}
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-amber-500 text-xl mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Não recebeu o email?</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Verifique sua <strong>pasta de spam</strong> ou <strong>lixo eletrônico</strong>. 
                  Emails automáticos podem ser filtrados pelo Gmail.
                </p>
              </div>
            </div>
            <button
              id="go-to-verify-btn"
              onClick={() => router.push("/recuperar-senha/verificar")}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition"
            >
              Inserir Código
            </button>
          </div>
        )}

        {/* Voltar ao login */}
        <button
          id="back-to-login-btn"
          onClick={() => router.push("/login")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mx-auto mt-6 transition"
        >
          <IoArrowBack className="w-4 h-4" />
          Voltar ao login
        </button>
      </div>
    </div>
  );
}
