const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-dental-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold text-dental-700">DentalClear</span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-dental-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-dental-600 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-dental-600 transition-colors">Pricing</a>
        </div>
        <a
          href={APP_URL}
          className="bg-dental-600 hover:bg-dental-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Open app
        </a>
      </div>
    </nav>
  );
}
