type PosterSize = 'small' | 'normal' | 'large';

interface PosterProps {
  title: string;
  type?: 'pelicula' | 'serie';
  color?: string;
  posterUrl?: string;
  size?: PosterSize;
}

const SIZE_WIDTH: Record<PosterSize, number> = {
  small: 56,
  normal: 80,
  large: 180,
};

export function Poster({ title, type, color, posterUrl, size = 'normal' }: PosterProps) {
  const width = SIZE_WIDTH[size];

  return (
    <div
      className="poster"
      style={{ width, background: color ?? 'var(--bg-2)' }}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : null}
      <div className="poster-label">
        <div style={{
          fontWeight: 700,
          fontSize: size === 'large' ? 14 : 10,
          color: '#1B1A24',
          textTransform: 'uppercase',
          lineHeight: 1.1,
        }}>
          {title}
        </div>
        {type && (
          <div style={{ fontSize: 9, opacity: 0.6, color: '#1B1A24', marginTop: 4 }}>
            {type === 'pelicula' ? '🎬 PELÍCULA' : '📺 SERIE'}
          </div>
        )}
      </div>
    </div>
  );
}
