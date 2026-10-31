import type { ReactNode } from "react";

type GenerateActionBarProps = {
  label?: string;
  disabled?: boolean;
  busy?: boolean;
  onGenerate: () => void;
  leading?: ReactNode;
};

export function GenerateActionBar({
  label = "Generate audio", disabled = false, busy = false, onGenerate, leading,
}: GenerateActionBarProps) {
  return (
    <div className="af-generate-bar">
      <button
        type="button"
        className="af-button af-button-primary"
        disabled={disabled || busy}
        onClick={onGenerate}
        aria-busy={busy}
      >
        {leading}
        <span>{busy ? "Generating…" : label}</span>
      </button>
    </div>
  );
}
