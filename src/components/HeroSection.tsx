import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex items-center bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Detect Tomato Leaf Diseases with 
                <span className="text-green-600"> AI</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Upload an image and get instant disease prediction with actionable insights. 
                Protect your tomato crops with cutting-edge artificial intelligence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Upload Image
              </button>
              <button 
                className="px-8 py-4 border border-green-600 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>99% Accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Instant Results</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Expert Backed</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-3xl p-8 shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=400&fit=crop&q=80"
                alt="AI analyzing fresh red tomatoes on healthy plants"
                className="w-full h-80 object-cover rounded-2xl"
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">AI Analyzing</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-700">Disease Detected</div>
                  <div className="text-xs text-green-600">95% Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}