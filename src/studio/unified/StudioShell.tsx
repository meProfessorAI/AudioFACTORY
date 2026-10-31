import React, { ReactNode } from 'react';

interface StudioShellProps {
  header: ReactNode;
  navigation: ReactNode;
  canvas: ReactNode;
  inspector?: ReactNode;
  transport: ReactNode;
  isInspectorOpen?: boolean;
}

/**
 * Unified AudioFACTORY Studio Shell.
 * Single-screen creation workstation conforming to AudioFACTORY Handoff v1.0.
 */
export const StudioShell: React.FC<StudioShellProps> = ({
  header,
  navigation,
  canvas,
  inspector,
  transport,
  isInspectorOpen = true
}) => {
  return (
    <div className="af-shell" data-theme="light">
      {/* 56px Header */}
      {header}

      {/* Main Workspace Grid (64px Rail | Flexible Canvas | 288px Inspector) */}
      <div 
        className="af-workspace"
        style={{
          gridTemplateColumns: isInspectorOpen 
            ? '64px minmax(0, 1fr) 288px' 
            : '64px minmax(0, 1fr) 0px'
        }}
      >
        {navigation}
        <main className="min-w-0 overflow-y-auto flex-1 flex flex-col h-full bg-[var(--af-canvas)]">
          {canvas}
        </main>
        {inspector && isInspectorOpen && (
          <aside className="af-inspector">
            {inspector}
          </aside>
        )}
      </div>

      {/* Authoritative Sticky Audio Transport */}
      {transport}
    </div>
  );
};
