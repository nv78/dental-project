export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-dental-50 to-white pt-20 pb-28 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <span className="inline-block bg-dental-100 text-dental-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
          Now with AI insurance verification
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          No more surprise{" "}
          <span className="text-dental-600">dental bills</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          DentalClear shows patients their exact out-of-pocket cost and flexible
          payment options — before they ever sit in the chair.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="bg-dental-600 hover:bg-dental-700 text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors shadow-lg shadow-dental-500/30"
          >
            Get started free
          </a>
          <a
            href="#how-it-works"
            className="border border-dental-200 hover:border-dental-400 text-dental-700 font-semibold px-8 py-3 rounded-xl text-lg transition-colors"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
