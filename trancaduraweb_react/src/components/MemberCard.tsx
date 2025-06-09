export default function MemberCard() {
  return (
    <div className="w-full">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-sm sm:text-lg md:text-xl">Usuário</h2>
            <p className="text-background text-xs sm:text-sm md:text-base rounded-xl bg-foreground p-1">
              Tipo de Membro
            </p>
            <p className="text-background text-xs sm:text-sm md:text-base rounded-xl bg-foreground p-1">
              Ativo / Inativo
            </p>
          </div>
          <div className="text-gray-600 text-xs sm:text-sm md:text-lg">
            <p>email@email.com</p>
          </div>
          <div className="text-gray-600 text-xs sm:text-sm md:text-lg flex gap-1">
            <p>Último acesso:</p>
            <p>data, hora</p>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-2">
          <button className="text-sm w-20 cursor-pointer bg-background border border-2 border-gray-200 p-2 rounded-lg shadow-md">
            E-Mail
          </button>
          <button className="text-sm w-20 cursor-pointer bg-background border border-2 border-gray-200 p-2 rounded-lg shadow-md">
            Senha
          </button>
          <button className="text-sm text-background w-20 cursor-pointer bg-red-600 border border-2 border-gray-200 p-2 rounded-lg shadow-md">
            Desativar
          </button>
        </div>
      </div>
    </div>
  );
}
