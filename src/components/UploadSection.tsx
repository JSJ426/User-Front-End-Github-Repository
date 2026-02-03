import { useState } from "react";

export default function UploadSection() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    
    // Mock AI analysis
    setTimeout(() => {
      setResults({
        disease: "Early Blight",
        confidence: 94,
        severity: "Moderate",
        remedy: "Apply copper-based fungicide and improve air circulation around plants. Remove affected leaves and ensure proper watering at soil level."
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <section id="upload" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Upload Your Plant Image
          </h2>
          <p className="text-xl text-gray-600">
            Get instant AI-powered disease detection and treatment recommendations
          </p>
        </div>

        <div className="p-8 bg-white rounded-2xl shadow-lg">
          {!uploadedImage ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg text-gray-700 mb-2">Drag and drop your image here</p>
                  <p className="text-gray-500 mb-4">or</p>
                  <label className="cursor-pointer">
                    <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      Browse Files
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-400">
                  Supports: JPG, PNG, WebP (Max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Uploaded Image</h3>
                  <img
                    src={uploadedImage}
                    alt="Uploaded leaf"
                    className="w-full h-64 object-cover rounded-xl border"
                  />
                  <button
                    className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setUploadedImage(null);
                      setResults(null);
                    }}
                  >
                    Upload Different Image
                  </button>
                </div>

                {/* Analysis Results */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
                  
                  {!results && !isAnalyzing && (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <p className="text-gray-600 mb-4">Ready to analyze your image</p>
                      <button 
                        onClick={analyzeImage}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Predict Disease
                      </button>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        <span>AI is analyzing your image...</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-3/5 transition-all duration-300"></div>
                      </div>
                    </div>
                  )}

                  {results && (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-red-800">Disease Detected</h4>
                          <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            {results.confidence}% Confidence
                          </span>
                        </div>
                        <p className="text-red-700 font-medium">{results.disease}</p>
                        <p className="text-sm text-red-600 mt-1">Severity: {results.severity}</p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Recommended Treatment</h4>
                        <p className="text-green-700 text-sm">{results.remedy}</p>
                      </div>

                      <button 
                        onClick={analyzeImage}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Analyze Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}