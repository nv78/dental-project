export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div>
          <span className="text-white font-bold text-lg">DentalClear</span>
          <p className="text-sm mt-2 max-w-xs">
            Transparent dental financing for modern practices.
          </p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="space-y-2">
            <p className="text-white font-semibold">Product</p>
            <a href="#features" className="block hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="block hover:text-white transition-colors">Pricing</a>
            <a href="#how-it-works" className="block hover:text-white transition-colors">How it works</a>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Company</p>
            <a href="#contact" className="block hover:text-white transition-colors">Contact</a>
            <a href="#" className="block hover:text-white transition-colors">Privacy</a>
            <a href="#" className="block hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-xs text-center">
        © {new Date().getFullYear()} DentalClear. All rights reserved.
      </div>
    </footer>
  );
}
