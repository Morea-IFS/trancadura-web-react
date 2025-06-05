const DesktopMenu = () => {
  return (
    <ul className="hidden md:flex gap-4 text-lg">
      <li>
        <a href="/" className="">
          Tranca
        </a>
      </li>
      <li>
        <a href="/historico" className="">
          Histórico
        </a>
      </li>
      <li>
        <a href="/membros" className="">
          Membros
        </a>
      </li>
      <li>
        <a href="/logout" className="">
          Logout
        </a>
      </li>
    </ul>
  );
};

export default DesktopMenu;
