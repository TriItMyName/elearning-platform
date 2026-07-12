import { useCallback, useState } from 'react'

import { ConfirmDialog, type ConfirmDialogProps } from '@/components/ui/ConfirmDialog'

export interface ConfirmOptions {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmDialogProps['tone']
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void
}

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve })
    })
  }, [])

  const close = useCallback((result: boolean) => {
    setPending((current) => {
      current?.resolve(result)
      return null
    })
  }, [])

  const ConfirmDialogHost = () => (
    <ConfirmDialog
      open={pending !== null}
      title={pending?.title}
      description={pending?.description ?? ''}
      confirmLabel={pending?.confirmLabel}
      cancelLabel={pending?.cancelLabel}
      tone={pending?.tone}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  )

  return { confirm, ConfirmDialogHost }
}
