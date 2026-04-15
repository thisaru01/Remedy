import Navbar from "@/public/components/Navbar.jsx";
import Hero from "@/public/home/sections/Hero.jsx";
import Features from "@/public/home/sections/Features.jsx";
import Contact from "@/public/home/sections/Contact.jsx";
import Footer from "@/components/Footer.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
