import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableTextProps {
  value: string | number;
  onSave: (newValue: string) => void;
  className?: string;
  type?: 'text' | 'number' | 'textarea';
  label?: string; // Optional label for accessibility/context
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onSave, 
  className = "", 
  type = 'text',
  label
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);

  const handleSave = () => {
    if (tempValue !== value.toString()) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 relative z-10 min-w-[100px]">
        {type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full p-2 border-2 border-kn-lightBlue rounded shadow-sm focus:outline-none text-kn-black bg-white text-sm"
            rows={3}
            onBlur={handleSave}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-full px-2 py-1 border-2 border-kn-lightBlue rounded shadow-sm focus:outline-none text-kn-black bg-white h-full"
          />
        )}
        {/* Icons are visual indicators mostly, as blur handles save */}
      </div>
    );
  }

  return (
    <div 
      onDoubleClick={() => setIsEditing(true)} 
      className={`cursor-pointer hover:bg-black/5 rounded px-1 transition-colors duration-200 border border-transparent hover:border-black/10 ${className}`}
      title="Clique duas vezes para editar"
    >
      {value}
    </div>
  );
};