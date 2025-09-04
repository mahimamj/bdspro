import React from 'react';
import { LucideIcon } from 'lucide-react';

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'positive', 
  onClick,
  className = '' 
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return val;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗';
    if (changeType === 'negative') return '↘';
    return '→';
  };

  return (
    <div 
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? `$${formatValue(value)}` : value}
          </p>
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {getChangeIcon()} {change}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            vs last month
          </div>
        </div>
      )}
      
      {!change && (
        <div className="text-xs text-gray-500">
          Click to view details
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
