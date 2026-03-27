import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  positive?: boolean
  icon: string
  color?: 'purple' | 'yellow' | 'green' | 'blue'
}

const colors = {
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20',
  green: 'from-green-500/20 to-green-600/10 border-green-500/20',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
}

export default function StatsCard({ title, value, change, positive, icon, color = 'purple' }: StatsCardProps) {
  return (
    <div className={cn('bg-gradient-to-br border rounded-2xl p-6', colors[color])}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        {change && (
          <span className={cn('text-xs font-medium px-2 py-1 rounded-full', positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-sm text-white/50">{title}</div>
    </div>
  )
}
