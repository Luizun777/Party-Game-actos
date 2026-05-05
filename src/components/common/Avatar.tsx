import { AVATAR_CATALOG } from './avatarCatalog';

type AvatarSize = 'small' | 'normal' | 'large' | 'xl';
type AvatarStyle = 'flat' | 'chunky' | 'disc' | 'geom';

interface AvatarProps {
  id: string;
  size?: AvatarSize;
  avatarStyle?: AvatarStyle;
  selected?: boolean;
}

const SIZE_CLASS: Record<AvatarSize, string> = {
  small: 'small',
  normal: '',
  large: 'large',
  xl: 'xl',
};

const FONT_SIZE: Record<AvatarSize, number> = {
  small: 22,
  normal: 34,
  large: 56,
  xl: 76,
};

export function Avatar({ id, size = 'normal', avatarStyle = 'flat', selected = false }: AvatarProps) {
  const data = AVATAR_CATALOG.find(a => a.id === id) ?? AVATAR_CATALOG[0];
  const cls = ['avatar', SIZE_CLASS[size]].filter(Boolean).join(' ');
  const fontSize = FONT_SIZE[size];

  const selectedStyle: React.CSSProperties = selected
    ? { borderColor: 'var(--brand)', boxShadow: '0 0 0 4px oklch(0.72 0.22 var(--brand-h) / 0.2)' }
    : {};

  let inner: React.ReactNode;

  if (avatarStyle === 'chunky') {
    inner = (
      <div style={{
        width: '100%', height: '100%',
        background: data.bg,
        border: '2px solid #1B1A24',
        borderRadius: 12,
        display: 'grid', placeItems: 'center',
        fontSize,
      }}>
        {data.emoji}
      </div>
    );
  } else if (avatarStyle === 'disc') {
    inner = (
      <div style={{
        width: '100%', height: '100%',
        background: `radial-gradient(circle at 30% 30%, ${data.bg}, color-mix(in oklch, ${data.bg} 70%, black))`,
        borderRadius: '50%',
        display: 'grid', placeItems: 'center',
        fontSize,
      }}>
        {data.emoji}
      </div>
    );
  } else if (avatarStyle === 'geom') {
    const points = '50,4 92,28 92,72 50,96 8,72 8,28';
    inner = (
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <polygon points={points} fill={data.bg} />
        <text x="50" y="58" textAnchor="middle" fontSize={fontSize}>{data.emoji}</text>
      </svg>
    );
  } else {
    // flat (default)
    inner = (
      <div style={{
        width: '100%', height: '100%',
        background: data.bg,
        borderRadius: '50%',
        display: 'grid', placeItems: 'center',
        fontSize,
      }}>
        {data.emoji}
      </div>
    );
  }

  return (
    <div className={cls} style={selectedStyle}>
      {inner}
    </div>
  );
}
