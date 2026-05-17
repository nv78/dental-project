const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Perfect for solo practices.",
    features: [
      "Up to 100 quotes/month",
      "Instant cost breakdown",
      "Email support",
    ],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/mo",
    description: "For busy multi-chair offices.",
    features: [
      "Unlimited quotes",
      "AI insurance verification",
      "SMS payment reminders",
      "Moneris payment processing",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Multi-location dental groups.",
    features: [
      "Everything in Growth",
      "Custom ML model training",
      "SSO & role-based access",
      "Dedicated success manager",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-500">
            No setup fees. No long-term contracts. Cancel any time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? "border-dental-500 bg-dental-600 text-white shadow-2xl shadow-dental-500/30 scale-105"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3
                className={`text-sm font-semibold uppercase tracking-widest mb-1 ${
                  plan.highlight ? "text-dental-100" : "text-dental-600"
                }`}
              >
                {plan.name}
              </h3>
              <div className="flex items-end gap-1 mb-2">
                <span
                  className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm mb-1 ${plan.highlight ? "text-dental-100" : "text-gray-400"}`}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={`text-sm mb-6 ${plan.highlight ? "text-dental-100" : "text-gray-500"}`}
              >
                {plan.description}
              </p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-center gap-2 text-sm ${
                      plan.highlight ? "text-dental-50" : "text-gray-600"
                    }`}
                  >
                    <span className={plan.highlight ? "text-dental-200" : "text-dental-500"}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                  plan.highlight
                    ? "bg-white text-dental-700 hover:bg-dental-50"
                    : "bg-dental-600 hover:bg-dental-700 text-white"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
