import { BADGE_TYPES } from '@/types'

interface BadgeProps {
  badge: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Badge({ badge, size = 'md' }: BadgeProps) {
  const badgeType = BADGE_TYPES.find((b) => b.id === badge)

  if (!badgeType) return null

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  // Determine colors based on badge type
  let colorClasses = ''

  if (badge === 'FREE') {
    // Gratuit: fond #E8FFF2, texte #0E8F4B
    colorClasses = 'bg-[#E8FFF2] text-[#0E8F4B] border-[#0E8F4B]/20'
  } else if (['PMR', 'CHANGING_TABLE', 'STROLLER'].includes(badge)) {
    // Accessibility: fond #E8F7EF, texte #0F5132
    colorClasses = 'bg-[#E8F7EF] text-[#0F5132] border-[#0F5132]/20'
  } else {
    // Default (catégories): fond brand-50, texte brand
    colorClasses = 'bg-brand-50 text-brand border-brand/20'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border ${
        sizeClasses[size]
      } ${colorClasses}`}
      style={{ borderRadius: 'var(--radius-badge)' }}
      title={badgeType.label}
    >
      <span>{badgeType.icon}</span>
      <span>{badgeType.label}</span>
    </span>
  )
}

// Component for "New" badge (< 72h)
export function NewBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold bg-[#FFF4E0] text-[#B45309] border border-[#B45309]/20 ${sizeClasses[size]}`}
      style={{ borderRadius: 'var(--radius-badge)' }}
    >
      <span>✨</span>
      <span>Nouveau</span>
    </span>
  )
}
