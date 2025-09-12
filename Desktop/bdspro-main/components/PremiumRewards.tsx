'use client';

import { motion } from 'framer-motion';
import { Gift, Trophy, Star, Target, Award } from 'lucide-react';

const PremiumRewards = () => {
  const rewards = [
    {
      name: 'Samsung Tablet',
      milestone: 'First Milestone',
      description: 'Earn your first premium reward with consistent trading performance.',
      image: '/tablet.png',
      color: 'from-blue-500 to-cyan-500',
      icon: Gift
    },
    {
      name: 'iPhone 16 Pro',
      milestone: 'Second Milestone',
      description: 'Achieve higher trading volumes and unlock this premium smartphone.',
      image: '/iphone.png',
      color: 'from-purple-500 to-pink-500',
      icon: Trophy
    },
    {
      name: 'MacBook M4',
      milestone: 'Third Milestone',
      description: 'Reach elite trader status and receive this powerful laptop.',
      image: '/macbook.png',
      color: 'from-gray-600 to-gray-800',
      icon: Star
    },
    {
      name: 'Royal Enfield',
      milestone: 'Fourth Milestone',
      description: 'Become a top performer and earn this prestigious motorcycle.',
      image: '/motorcycle.png',
      color: 'from-orange-500 to-red-500',
      icon: Target
    },
    {
      name: 'Tata Nexon',
      milestone: 'Ultimate Milestone',
      description: 'Reach the pinnacle of success and drive home in this electric vehicle.',
      image: '/car.png',
      color: 'from-green-500 to-emerald-500',
      icon: Award
    }
  ];

  return (
    <section id="rewards" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Premium <span className="gradient-text">Rewards</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock exclusive rewards as you achieve trading milestones. Our self-business 
            reward system recognizes your dedication and success.
          </p>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Reward Image Placeholder */}
              <div className={`h-48 bg-gradient-to-r ${reward.color} flex items-center justify-center`}>
                <reward.icon className="w-16 h-16 text-white opacity-80" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{reward.name}</h3>
                  <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {reward.milestone}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {reward.description}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How the Reward System Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Trading</h4>
              <p className="text-gray-600">
                Begin your trading journey with any of our investment plans
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Achieve Milestones</h4>
              <p className="text-gray-600">
                Reach trading volume and performance milestones to unlock rewards
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Claim Rewards</h4>
              <p className="text-gray-600">
                Receive your premium rewards and continue your success journey
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Earn Premium Rewards?</h3>
            <p className="text-lg mb-6 opacity-90">
              Start your trading journey today and work towards unlocking these exclusive rewards.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Trading Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumRewards;
