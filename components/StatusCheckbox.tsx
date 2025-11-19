import React from 'react';
import { Check } from 'lucide-react';

interface StatusCheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export const StatusCheckbox: React.FC<StatusCheckboxProps> = ({ checked, onChange }) => {
  // If onChange is provided, it's interactive (single click). 
  // If not, it's read-only or handled externally (but for this requirement, let's make it clickable)
  
  const handleClick = () => {
    if (onChange) onChange(!checked);
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-200
        ${checked 
          ? 'bg-kn-darkBlue border-kn-darkBlue shadow-sm' 
          : 'bg-white border-kn-neutral2 hover:border-kn-lightBlue'}
      `}
    >
      {checked && <Check size={16} className="text-white stroke-[3]" />}
    </div>
  );
};