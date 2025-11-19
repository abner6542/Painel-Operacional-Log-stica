import React from 'react';
import { ProgressBarData } from '../types';
import { EditableText } from './EditableText';
import { Trash2 } from 'lucide-react';

interface Props {
  data: ProgressBarData;
  onUpdate: (field: keyof ProgressBarData, value: any) => void;
  onDelete: () => void;
}

export const ProgressBar: React.FC<Props> = ({ data, onUpdate, onDelete }) => {
  const percentage = data.total > 0 ? Math.min(100, Math.round((data.current / data.total) * 100)) : 0;
  
  // Fallback seguro caso a cor não venha do localStorage
  const safeColor = data.color || 'blue';

  const colorClasses = {
    red: 'bg-kn-red',
    blue: 'bg-kn-lightBlue',
    green: 'bg-kn-green',
  };

  const textClasses = {
    red: 'text-kn-red',
    blue: 'text-kn-lightBlue',
    green: 'text-kn-green',
  };

  return (
    <div className="group relative bg-white p-5 rounded-xl shadow-sm border border-kn-neutral1 flex flex-col gap-3 h-full transition-all hover:shadow-md">
      <button 
        onClick={onDelete}
        className="absolute -top-3 -right-3 bg-white border border-kn-neutral2 p-2 rounded-full text-kn-neutral3 hover:text-kn-red hover:border-kn-red opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm"
        title="Remover Shipment"
      >
        <Trash2 size={18} />
      </button>

      <div className="flex justify-between items-start">
        <div className="font-bold text-kn-darkBlue text-base md:text-lg flex-1 pr-2 truncate">
            <EditableText value={data.label} onSave={(v) => onUpdate('label', v)} />
        </div>
        <span className={`font-black text-2xl md:text-3xl ${textClasses[safeColor] || textClasses.blue}`}>
            {percentage}%
        </span>
      </div>
      
      <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
        <div 
            className={`h-full ${colorClasses[safeColor] || colorClasses.blue} transition-all duration-1000 ease-out`} 
            style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-sm md:text-base text-kn-neutral4 mt-1 font-medium">
        <div className="flex items-center gap-1">
            <span>Atual:</span>
            <EditableText type="number" value={data.current} onSave={(v) => onUpdate('current', Number(v))} className="font-bold text-kn-black" />
        </div>
        <div className="flex items-center gap-1">
            <span>Meta:</span>
            <EditableText type="number" value={data.total} onSave={(v) => onUpdate('total', Number(v))} className="font-bold text-kn-black" />
        </div>
      </div>
    </div>
  );
};