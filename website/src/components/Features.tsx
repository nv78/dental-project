const features = [
  {
    icon: "🔍",
    title: "AI Insurance Verification",
    description:
      "Our ML model cross-checks benefits against 1M+ historical claims in seconds, so your front desk spends less time on hold.",
  },
  {
    icon: "💳",
    title: "Flexible Payment Plans",
    description:
      "Offer 1, 3, 6, or 12-month plans. Patients choose what fits their budget; you get paid the full amount upfront.",
  },
  {
    icon: "📱",
    title: "SMS Payment Reminders",
    description:
      "Automated Twilio-powered texts keep patients on track without any manual follow-up from your team.",
  },
  {
    icon: "📊",
    title: "Real-time Dashboard",
    description:
      "Track every quote, approval, and payment from a single screen. Export CSV reports in one click.",
  },
  {
    icon: "🔒",
    title: "HIPAA-Ready Infrastructure",
    description:
      "All data encrypted at rest and in transit. Role-based access controls ensure only the right staff see patient info.",
  },
  {
    icon: "⚡",
    title: "Instant Quote Generation",
    description:
      "Enter a treatment cost, drag the coverage slider, and watch the breakdown update in real time — no page reload needed.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Everything your practice needs
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            From the first coverage check to the final payment, DentalClear
            handles the financial conversation so you can focus on care.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-dental-50 rounded-2xl p-8 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
