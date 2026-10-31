import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div 
        className="relative w-full sm:max-w-lg max-h-[85dvh] rounded-t-3xl sm:rounded-2xl border shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-200"
        style={{
          backgroundColor: 'var(--af-surface, var(--skin-bg-card, #FFFFFF))',
          borderColor: 'var(--af-border, var(--skin-border, #E8D5C2))',
          color: 'var(--af-text, var(--skin-text-primary, #431407))',
          boxShadow: 'var(--skin-shadow, 0 -10px 30px rgba(0,0,0,0.12))'
        }}
      >
        {/* Mobile Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div 
            className="w-12 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--af-border, var(--skin-border-strong, #D7BCA3))' }}
          />
        </div>

        {/* Header */}
        <div 
          className="px-5 py-3.5 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'var(--af-border, var(--skin-border, #E8D5C2))' }}
        >
          <div>
            <h3 className="text-base font-bold tracking-tight">{title}</h3>
            {subtitle && (
              <p 
                className="text-xs"
                style={{ color: 'var(--af-text-muted, var(--skin-text-muted, #9A5B32))' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border flex items-center justify-center transition-colors hover:opacity-80 cursor-pointer"
            style={{
              borderColor: 'var(--af-border, var(--skin-border, #E8D5C2))',
              backgroundColor: 'var(--af-raised, var(--skin-bg-subtle, #F6EDE2))',
              color: 'var(--af-text-secondary, var(--skin-text-secondary, #7C2D12))'
            }}
            aria-label="Close sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
