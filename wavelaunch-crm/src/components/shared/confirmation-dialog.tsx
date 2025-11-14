'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Info, Trash2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'default'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  const Icon = getIcon(variant)
  const iconColor = getIconColor(variant)
  const confirmButtonClass = getConfirmButtonClass(variant)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('rounded-full p-2', iconColor.bg)}>
              <Icon className={cn('h-5 w-5', iconColor.text)} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={confirmButtonClass}
          >
            {loading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function getIcon(variant: ConfirmationVariant) {
  switch (variant) {
    case 'danger':
      return Trash2
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return AlertCircle
  }
}

function getIconColor(variant: ConfirmationVariant) {
  switch (variant) {
    case 'danger':
      return {
        bg: 'bg-red-100',
        text: 'text-red-600',
      }
    case 'warning':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
      }
    case 'info':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
      }
  }
}

function getConfirmButtonClass(variant: ConfirmationVariant) {
  switch (variant) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    case 'info':
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    default:
      return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
  }
}

/**
 * Hook to manage confirmation dialog state
 */
export function useConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [config, setConfig] = React.useState<{
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: ConfirmationVariant
    onConfirm: () => void | Promise<void>
  } | null>(null)

  const confirm = (options: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: ConfirmationVariant
    onConfirm: () => void | Promise<void>
  }) => {
    setConfig(options)
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (!config) return

    setLoading(true)
    try {
      await config.onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const dialog = config ? (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={handleConfirm}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
      loading={loading}
    />
  ) : null

  return { confirm, dialog, isOpen, setIsOpen }
}

// Add React import for the hook
import React from 'react'
