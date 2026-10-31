import React, { ReactNode } from 'react';

interface StudioShellProps {
  header: ReactNode;
  navigation: ReactNode;
  canvas: ReactNode;
  inspector?: ReactNode;
  transport?: ReactNode;
  mobileNav?: ReactNode;
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
  mobileNav,
  isInspectorOpen = true
}) => {
  return (
    <div className="af-shell" data-theme="light">
      {/* 56px Header */}
      {header}

      {/* Main Workspace (Rail | Flexible Canvas | Desktop Inspector) */}
      <div className="af-workspace">
        {/* Desktop Vertical Icon Rail */}
        <aside className="af-rail-container">
          {navigation}
        </aside>

        {/* Central Dominant Canvas */}
        <main className="af-canvas-container">
          {canvas}
        </main>

        {/* Desktop Inspector */}
        {inspector && isInspectorOpen && (
          <aside className="af-inspector-container">
            {inspector}
          </aside>
        )}
      </div>

      {/* Authoritative Bottom Production Dock */}
      {(transport || mobileNav) && (
        <footer className="af-bottom-dock">
          {/* Audio Transport (when active) */}
          {transport}

          {/* Mobile Bottom Navigation (screens < 768px) */}
          {mobileNav}
        </footer>
      )}
    </div>
  );
};
