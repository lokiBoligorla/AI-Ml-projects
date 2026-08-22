import React from 'react';

const GlassCard = ({ children, className = '', glow = false, hoverEffect = true }) => {
  return (
    <div className={`
      rounded-3xl p-6 backdrop-blur-md 
      ${glow ? 'glass-panel-glow' : 'glass-panel'}
      ${hoverEffect ? 'hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-primary-500/5 hover:border-white/10' : ''}
      transition-all duration-300 ease-out 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;
