import Link from "next/link";

export default function DesktopMenu() {
  return (
    <ul className="hidden md:flex gap-4 text-lg">
      <li>
        <Link href="/">Tranca</Link>
      </li>
      <li>
        <Link href="/historico">Histórico</Link>
      </li>
      <li>
        <Link href="/membros">Membros</Link>
      </li>
      <li>
        <Link href="/logout">Logout</Link>
      </li>
    </ul>
  );
}
