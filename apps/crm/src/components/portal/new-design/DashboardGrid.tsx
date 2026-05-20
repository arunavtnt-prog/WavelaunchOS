import React from 'react'
import { CheckCircle2, Clock, TrendingUp, FileText, MessageSquare, Calendar, ChevronRight, User, Edit, Target, ArrowUpRight } from 'lucide-react'
import { colors, borderRadius } from './tokens'

interface DashboardGridProps {
  children: React.ReactNode
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {children}
    </div>
  )
}

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => {
  return (
    <div className={`bg-white border-[${colors['gray-200']} rounded-[${borderRadius.xl]} ${className}`}>
      {children}
    </div>
  )
}

export const PrimaryCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => {
  return (
    <div className={`bg-gradient-to-br from-[${colors.primary}] to-[${colors['primary-hover']}] rounded-[${borderRadius.xl]} p-6 text-white shadow-lg ${className}`}>
      {children}
    </div>
  )
}
