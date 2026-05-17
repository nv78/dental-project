"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-24 px-6 bg-dental-50">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Book a demo
        </h2>
        <p className="text-lg text-gray-500 mb-10">
          See DentalClear live in your browser — no software to install.
        </p>
        {submitted ? (
          <div className="bg-dental-100 text-dental-700 font-semibold rounded-2xl px-8 py-10 text-lg">
            Thanks! We&apos;ll be in touch within one business day.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-8 text-left space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                required
                type="text"
                placeholder="Dr. Jane Smith"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work email
              </label>
              <input
                required
                type="email"
                placeholder="jane@clinicdomain.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Practice name
              </label>
              <input
                required
                type="text"
                placeholder="Bright Smiles Dental"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-dental-600 hover:bg-dental-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Request demo
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
