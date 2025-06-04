const Header = () => {
  return (
    <header className="bg-white w-full">
      <div className="text-black flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">MOREA Trancadura</h1>
        <nav>
          <ul className="flex gap-4">
            <li><a href="/" className="hover:underline">Início</a></li>
            <li><a href="/membros" className="hover:underline">Membros</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;