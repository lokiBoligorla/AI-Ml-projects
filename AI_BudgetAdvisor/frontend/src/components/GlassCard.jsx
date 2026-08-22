import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = true, title = '', headerAction = null }) => {
  return (
    <div className={`
      glass-panel rounded-2xl p-6 transition-all duration-300 w-full
      ${hoverEffect ? 'glass-panel-hover' : ''}
      ${className}
    `}>
      {title && (
        <div className="flex items-center justify-between mb-4 border-b border-glassBorder pb-3">
          <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {title}
          </h3>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
};

export default GlassCard;
