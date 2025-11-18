
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg ${className}`}>
        {(title || actions) && (
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                {actions && <div>{actions}</div>}
            </div>
        )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
