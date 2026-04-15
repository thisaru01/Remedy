import { Brain, Calendar, History, ShieldCheck } from "lucide-react";

const features = [
  {
    name: "AI Symptom Checker",
    description: "Get instant, personalized health insights powered by our advanced medical AI model.",
    icon: Brain,
  },
  {
    name: "Easy Appointments",
    description: "Book visits with top specialists across multiple disciplines in just a few clicks.",
    icon: Calendar,
  },
  {
    name: "Health Tracking",
    description: "Securely manage your assessment history and monitor your progress over time.",
    icon: History,
  },
  {
    name: "Expert Guidance",
    description: "Receive clear, actionable advice on care urgency and your next medical steps.",
    icon: ShieldCheck,
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-bold uppercase tracking-wider text-blue-600">
            Better Healthcare
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Comprehensive Care at Your Fingertips
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Discover how Remedy simplifies your health management with 
            cutting-edge AI technology and a commitment to patient-centered care.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col group">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <dt className="text-lg font-bold leading-7 text-slate-900">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-500">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
