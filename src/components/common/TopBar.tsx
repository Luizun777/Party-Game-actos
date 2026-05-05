interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function TopBar({ title, onBack, right }: TopBarProps) {
  return (
    <div className="top-bar">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label="Atrás">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <h2>{title}</h2>
      {right}
    </div>
  );
}
