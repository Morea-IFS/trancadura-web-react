import LoginForm from "@/components/Forms/LoginForm";
import { IoLockClosedOutline } from "react-icons/io5";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-login">
      <div className="bg-background w-full max-w-xs sm:max-w-lg md:max-w-xl p-8 rounded-lg shadow-lg my-4">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
          <IoLockClosedOutline className="w-12 h-12 sm:w-16 sm:h-16 text-background" />
        </div>
        <div className="w-full text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Sistema MOREA</h2>
          <p className="text-md sm:text-lg text-gray-600">
            Faça login para acessar os sistemas de controle
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
