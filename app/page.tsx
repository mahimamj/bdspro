'use client';

import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import InvestmentPlans from '@/components/InvestmentPlans';
import PremiumRewards from '@/components/PremiumRewards';
import Community from '@/components/Community';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BDS PRO
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-gray-700 hover:text-blue-500 font-medium">Features</a>
              <a href="#plans" className="text-gray-700 hover:text-blue-500 font-medium">Plans</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-500 font-medium">Contact</a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="pt-16">
        <Hero />
        <Features />
        <InvestmentPlans />
        <PremiumRewards />
        <Community />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
}
