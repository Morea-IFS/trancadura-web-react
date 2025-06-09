import Header from "@/components/Header";
import MemberCard from "@/components/MemberCard";

export default function Membros() {
  return (
    <div>
      <header>
        <Header />
      </header>
      <section className="p-4 md:w-[70%] mx-auto">
        <MemberCard />
      </section>
    </div>
  );
}
