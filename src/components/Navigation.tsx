interface NavigationProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export default function Navigation({ onLoginClick, onSignupClick }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍅</span>
            <span className="text-xl font-semibold text-green-800">Tomato Disease Detection</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-green-700 transition-colors">Home</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-green-700 transition-colors">How it Works</a>
            <a href="#upload" className="text-gray-700 hover:text-green-700 transition-colors">Upload</a>
            <a href="#about" className="text-gray-700 hover:text-green-700 transition-colors">About</a>
            <a href="#contact" className="text-gray-700 hover:text-green-700 transition-colors">Contact</a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 text-gray-700 hover:text-green-700 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onSignupClick}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-700 hover:text-green-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}