'use client';

import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Star, Check } from 'lucide-react';

const InvestmentPlans = () => {
  const plans = [
    {
      name: 'Starter',
      amount: '50 USDT',
      selfInvestment: '6%',
      referralOrbit: '1%',
      features: [
        'Basic trading tools',
        'Email support',
        'Market analysis',
        'Mobile app access'
      ],
      popular: false,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Professional',
      amount: '500 USDT',
      selfInvestment: '6%',
      referralOrbit: '1%',
      features: [
        'Advanced trading tools',
        'Priority support',
        'Real-time alerts',
        'Portfolio tracking',
        'Educational resources'
      ],
      popular: true,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Premium',
      amount: '5000 USDT',
      selfInvestment: '6%',
      referralOrbit: '1%',
      features: [
        'All Professional features',
        'Dedicated account manager',
        'Custom trading strategies',
        'VIP support',
        'Exclusive market insights',
        'Priority withdrawals'
      ],
      popular: false,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section id="plans" className="py-20 bg-white">
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
            Investment <span className="gradient-text">Plans</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your trading journey. All plans include our core features 
            with self-investment returns and referral opportunities.
          </p>
          
          {/* Investment Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Self Investment</h3>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">6% Returns</p>
              <p className="text-gray-600">Earn consistent returns on your own investments</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Referral Orbits</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">1% Each</p>
              <p className="text-gray-600">Earn from your referral network's investments</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                plan.popular 
                  ? 'border-primary-500 scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{plan.amount}</div>
                    <div className="text-gray-600">Minimum Investment</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{plan.selfInvestment}</div>
                      <div className="text-sm text-gray-600">Self Investment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{plan.referralOrbit}</div>
                      <div className="text-sm text-gray-600">Referral Orbit</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Choose {plan.name}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Important Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Withdrawal Policy</h4>
                <p>Minimum withdrawal amount: 10 USDT. Processing time: 24-48 hours.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Admin Charges</h4>
                <p>2% admin fee on all withdrawals. No hidden charges on deposits.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">USDT Only</h4>
                <p>All transactions are conducted in USDT for maximum stability and security.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestmentPlans;
