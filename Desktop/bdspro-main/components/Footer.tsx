'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Mail, Globe, Shield, FileText, Users } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Our Mission', href: '#mission' },
        { name: 'Team', href: '#team' },
        { name: 'Careers', href: '#careers' }
      ]
    },
    {
      title: 'Platform',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Investment Plans', href: '#plans' },
        { name: 'Premium Rewards', href: '#rewards' },
        { name: 'Community', href: '#community' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#help' },
        { name: 'Contact Us', href: '#contact' },
        { name: 'Live Chat', href: '#chat' },
        { name: 'FAQ', href: '#faq' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms & Conditions', href: '#terms' },
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Cookie Policy', href: '#cookies' },
        { name: 'AML Policy', href: '#aml' }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BDS PRO</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Empowering traders through high-quality tools, education, and support. 
                Join the future of crypto trading with BDS PRO.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-3" />
                  <a href="mailto:team.bdspro@gmail.com" className="hover:text-white transition-colors duration-200">
                    team.bdspro@gmail.com
                  </a>
                </div>
                <div className="flex items-center text-gray-400">
                  <Globe className="w-4 h-4 mr-3" />
                  <a href="https://www.bdspro.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                    www.bdspro.io
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-800 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Terms & Conditions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-400">
              <div>
                <h4 className="font-semibold text-white mb-3">Withdrawal Policy</h4>
                <ul className="space-y-2">
                  <li>• Minimum withdrawal: 10 USDT</li>
                  <li>• Processing time: 24-48 hours</li>
                  <li>• Admin fee: 2% on all withdrawals</li>
                  <li>• USDT-only transactions</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Investment Terms</h4>
                <ul className="space-y-2">
                  <li>• Self-investment returns: 6%</li>
                  <li>• Referral orbit returns: 1% each</li>
                  <li>• Minimum investment: 50 USDT</li>
                  <li>• No hidden charges on deposits</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Security & Compliance</h4>
                <ul className="space-y-2">
                  <li>• Bank-grade security protocols</li>
                  <li>• Multi-layer encryption</li>
                  <li>• Cold storage protection</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm mb-4 md:mb-0"
            >
              © {currentYear} BDS PRO. All rights reserved.
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-6 text-sm"
            >
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-black py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xs text-gray-500 text-center"
          >
            Risk Warning: Cryptocurrency trading involves substantial risk and may result in the loss of your invested capital. 
            You should ensure that you fully understand the risks involved and not invest more than you can afford to lose. 
            Past performance does not guarantee future results. BDS PRO is not a financial advisor and does not provide 
            financial advice. Please consult with a qualified financial advisor before making any investment decisions.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
