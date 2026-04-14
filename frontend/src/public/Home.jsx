import Navbar from "@/public/components/Navbar.jsx";
import Hero from "@/public/home/sections/Hero.jsx";
import Contact from "@/public/home/sections/Contact.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <Hero />
        <Contact />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} Remedy
        </div>
      </footer>
    </div>
  );
}
