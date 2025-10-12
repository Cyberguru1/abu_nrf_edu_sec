"use client"

import { useAppContext } from "@/context/AppContext"
import { ExitConfirmationDialog } from "@/components/ui/ExitConfirmationDialog"

export function ExitConfirmationHandler() {
  const { exitConfirmation, handleConfirmExit, handleCancelExit } = useAppContext()

  if (!exitConfirmation.isOpen) {
    return null
  }

  return (
    <ExitConfirmationDialog
      isOpen={exitConfirmation.isOpen}
      message={exitConfirmation.message}
      pendingId={exitConfirmation.pendingId}
      token={exitConfirmation.token}
      onConfirm={handleConfirmExit}
      onCancel={handleCancelExit}
    />
  )
}
