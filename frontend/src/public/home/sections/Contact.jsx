import { Button } from "@/components/ui/button";
import contactIllustration from "@/assets/contact_us.png";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative border-t border-slate-200 bg-white"
    >
      {/* Subtle background pattern to match hero */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col justify-center px-4 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_minmax(0,1fr)] lg:gap-16">
          {/* Left: text */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Contact us
              </p>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Let&apos;s talk about your healthcare needs
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              Share a few details and our team will help you find the right
              starting point on Remedy. Whether that&apos;s booking a
              appointment, using our AI symptom checker, we are here to help.
            </p>

            <div className="mt-10 grid gap-6 text-sm sm:grid-cols-2 sm:text-base">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Email</p>
                <p className="text-slate-500 hover:text-blue-600 transition-colors">
                  remedyhealthsl@gmail.com
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Support hours</p>
                <p className="text-slate-500">
                  Monday to Friday, 9:00am - 5:00pm
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button className="h-12 rounded-full bg-black px-10 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-lg">
                Send us an email
              </Button>
            </div>
          </div>

          {/* Right: illustration image */}
          <div className="w-full max-w-lg justify-self-center lg:justify-self-end">
            <div className="relative mx-auto w-full max-w-lg overflow-hidden aspect-4/3">
              <img
                src={contactIllustration}
                alt="Healthcare support illustration"
                className="h-full w-full object-contain transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
