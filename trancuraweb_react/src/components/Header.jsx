import MobileMenu from "@/components/Menus/MobileMenu";
import DesktopMenu from "@/components/Menus/DesktopMenu";

const Header = () => {
  return (
    <header className="bg-black text-white w-full">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">
          <a href="/">MOREA - Trancadura</a>
        </h1>
        <nav>
          <MobileMenu />
          <DesktopMenu />
        </nav>
      </div>
    </header>
  );
};

export default Header;
