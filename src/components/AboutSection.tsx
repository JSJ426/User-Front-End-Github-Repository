import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main About Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Mission Text */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div>
              <motion.h2 
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Our Mission
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Empowering farmers with intelligent, accessible, and affordable technology for early crop disease detection.
              </motion.p>
            </div>
            
            <motion.div 
              className="space-y-4 text-gray-700"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p>
                Our mission is to empower farmers with intelligent, accessible, and affordable technology that enables early detection of tomato crop diseases. By combining deep learning and mobile technology, we aim to improve agricultural productivity, reduce crop loss, and support sustainable farming through innovation in AI-driven plant health monitoring.
              </p>
              
              <p>
                We strive to bridge the gap between modern technology and traditional agriculture by making advanced disease detection tools available to everyone. Our solution focuses on usability, accuracy, and real-world impact to assist farmers in making timely and informed decisions.
              </p>
            </motion.div>

            {/* Mission Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 pt-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                { number: "99%", label: "Accuracy Rate" },
                { number: "24/7", label: "Available" },
                { number: "Global", label: "Access" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-green-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-3xl p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=400&fit=crop&q=80"
                  alt="Fresh red tomatoes growing on healthy tomato plants"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
              </motion.div>
              
              {/* Floating AI Analytics Card */}
              <motion.div 
                className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
                initial={{ opacity: 0, y: -20, x: 20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">AI Monitoring</span>
                </div>
                <div className="text-xs text-green-600 mt-1">Real-time Analysis</div>
              </motion.div>
              
              {/* Floating Disease Detection Card */}
              <motion.div 
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
                initial={{ opacity: 0, y: 20, x: -20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-700">Early Detection</div>
                  <div className="text-xs text-green-600">Disease Prevention</div>
                  <div className="w-16 h-1 bg-green-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-600 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "75%" }}
                      transition={{ duration: 1.5, delay: 1.2 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Technology Icons */}
              <motion.div 
                className="absolute top-4 left-4 flex space-x-2"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                viewport={{ once: true }}
              >
                {["🤖", "📱", "🍅"].map((icon, index) => (
                  <motion.div
                    key={index}
                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {icon}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Background Pattern */}
            <motion.div 
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-8 right-8 w-20 h-20 bg-green-100 rounded-full opacity-50"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-green-200 rounded-full opacity-30"></div>
              <div className="absolute top-1/2 right-0 w-12 h-12 bg-green-300 rounded-full opacity-20"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}