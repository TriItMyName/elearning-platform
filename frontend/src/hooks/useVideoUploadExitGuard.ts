import { useCallback } from 'react'

import type { ConfirmOptions } from '@/hooks/useConfirmDialog'

const VIDEO_UPLOAD_EXIT_CONFIRM: ConfirmOptions = {
  title: 'Video chưa tải xong',
  description:
    'Video đang được tải lên. Bạn có thể tiếp tục đợi hoặc chạy dưới nền — các thông tin khác (nếu đã sửa) vẫn được lưu.',
  confirmLabel: 'Chạy dưới nền',
  cancelLabel: 'Tiếp tục đợi',
  tone: 'primary',
}

export function useVideoUploadExitGuard(confirm: (options: ConfirmOptions) => Promise<boolean>) {
  return useCallback(
    async (isVideoUploading: boolean, action: () => void | Promise<void>) => {
      if (!isVideoUploading) {
        await action()
        return
      }
      const runInBackground = await confirm(VIDEO_UPLOAD_EXIT_CONFIRM)
      if (runInBackground) await action()
    },
    [confirm],
  )
}
