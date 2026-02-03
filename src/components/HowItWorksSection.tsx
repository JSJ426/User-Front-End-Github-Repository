export default function HowItWorksSection() {
  const steps = [
    {
      icon: "📸",
      title: "Upload Leaf Image",
      description: "Take a clear photo of the affected leaf and upload it to our platform. Our system accepts JPG, PNG, and WebP formats."
    },
    {
      icon: "🤖",
      title: "AI Analyzes the Disease",
      description: "Our advanced machine learning model analyzes the image, identifying patterns and symptoms with 99% accuracy in seconds."
    },
    {
      icon: "🩺",
      title: "Get Diagnosis & Treatment",
      description: "Receive instant disease identification, confidence score, and expert-backed treatment recommendations."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get professional plant disease diagnosis in three simple steps using our AI-powered platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-green-200 z-0 transform translate-x-4">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              )}
              
              {/* Step Card */}
              <div className="relative bg-green-50 rounded-2xl p-8 text-center z-10 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
                  {step.icon}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid - Removed Lightning Fast */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: "🎯", title: "High Accuracy", desc: "99% disease detection rate" },
            { icon: "🌍", title: "24/7 Available", desc: "Access anytime, anywhere" },
            { icon: "🧠", title: "AI Powered", desc: "Latest machine learning models" }
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}