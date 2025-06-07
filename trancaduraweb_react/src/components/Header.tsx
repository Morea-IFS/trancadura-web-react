import MobileMenu from "@/components/Menus/MobileMenu";
import DesktopMenu from "@/components/Menus/DesktopMenu";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-foreground text-background w-full">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">
          <Link href="/">MOREA - Trancadura</Link>
        </h1>
        <nav>
          <MobileMenu />
          <DesktopMenu />
        </nav>
      </div>
    </header>
  );
}
