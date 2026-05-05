import { AVATAR_CATALOG } from './avatarCatalog';
import { Avatar } from './Avatar';
import { sfxService } from '@/services/sfx/sfxService';

interface AvatarPickerProps {
  currentId?: string;
  onPick: (id: string) => void;
  onClose: () => void;
  avatarStyle?: 'flat' | 'chunky' | 'disc' | 'geom';
}

export function AvatarPicker({ currentId, onPick, onClose, avatarStyle = 'flat' }: AvatarPickerProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end',
        zIndex: 100,
        animation: 'slide-up 200ms var(--ease)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-1)',
          width: '100%',
          maxHeight: '70%',
          borderRadius: '24px 24px 0 0',
          padding: 20,
          overflowY: 'auto',
          boxShadow: '0 -20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{
          width: 40, height: 4,
          background: 'var(--line-strong)',
          borderRadius: 2,
          margin: '0 auto 16px',
        }} />
        <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Elige un avatar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {AVATAR_CATALOG.map(a => (
            <button
              key={a.id}
              onClick={() => { sfxService.play('ui_click'); onPick(a.id); }}
              style={{
                background: 'transparent', border: 0,
                padding: 6, borderRadius: 12, cursor: 'pointer',
              }}
            >
              <Avatar id={a.id} avatarStyle={avatarStyle} selected={currentId === a.id} />
              <div style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 4, textAlign: 'center' }}>
                {a.name.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
