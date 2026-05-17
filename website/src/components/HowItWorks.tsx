const steps = [
  {
    number: "01",
    title: "Enter treatment details",
    description:
      "The office manager types in the procedure and cost. DentalClear instantly queries the patient's insurance benefits.",
  },
  {
    number: "02",
    title: "AI verifies coverage",
    description:
      "Our model predicts approval likelihood and exact covered amount based on the patient's plan and procedure history.",
  },
  {
    number: "03",
    title: "Patient picks a payment plan",
    description:
      "A clean breakdown shows what insurance pays and what the patient owes, with 1–12 month options side by side.",
  },
  {
    number: "04",
    title: "Payment runs automatically",
    description:
      "Moneris processes the first payment. Subsequent installments charge automatically, with SMS reminders sent ahead of each date.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-dental-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-500">
            From check-in to collections in four simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6 items-start">
              <span className="text-5xl font-black text-dental-100 leading-none select-none">
                {step.number}
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
