import type { ReactNode } from "react";

type StudioShellProps = {
  header: ReactNode;
  navigation: ReactNode;
  canvas: ReactNode;
  inspector?: ReactNode;
  transport: ReactNode;
};

/**
 * Presentation-only shell.
 * Keep generation, billing, quota and persistence logic in existing services/hooks.
 */
export function StudioShell({
  header, navigation, canvas, inspector, transport,
}: StudioShellProps) {
  return (
    <div className="af-shell" data-theme="dark">
      <header className="af-header">{header}</header>
      <div className="af-workspace">
        <nav className="af-rail" aria-label="Studio tools">{navigation}</nav>
        <main className="af-canvas">{canvas}</main>
        {inspector ? <aside className="af-inspector">{inspector}</aside> : null}
      </div>
      <footer className="af-transport">{transport}</footer>
    </div>
  );
}
