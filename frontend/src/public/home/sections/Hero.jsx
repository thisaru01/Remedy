import { Link } from "react-router-dom";
import doctorHero from "@/assets/doctor_hero.png";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-white pt-16">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          background: "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 60%)"
        }}
      />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center">
          
          {/* Left Content */}
          <div className="flex-1 space-y-8 py-12 lg:py-24">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Get Appointment <br />
                <span className="text-blue-600">Easy And Fast</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-500">
                You can monitor and manage your health with the platform 
                we will provide. You can monitor and manage your appointments 
                with our top specialized doctors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/book-appointments"
                className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95"
              >
                Book Appointment
              </Link>
              <Link
                to="/remedy-ai"
                className="inline-flex items-center justify-center rounded-full border border-black bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-slate-50 active:scale-95"
              >
                Remedy AI
              </Link>
            </div>

            {/* Stats Section */}
            <div className="pt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">50k+</p>
                  <p className="text-xs font-medium text-blue-500/70">Happy patient</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">350+</p>
                  <p className="text-xs font-medium text-blue-500/70">Specialist Doctor</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">98%</p>
                  <p className="text-xs font-medium text-blue-500/70">Our Success</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative flex-1 lg:block">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div 
                className="absolute -inset-4 z-0 rounded-full bg-blue-50/50 blur-3xl"
                aria-hidden="true"
              />
              <img
                src={doctorHero}
                alt="Doctor giving a thumbs up"
                className="relative z-10 w-full object-contain animate-in fade-in slide-in-from-right-12 duration-1000"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
