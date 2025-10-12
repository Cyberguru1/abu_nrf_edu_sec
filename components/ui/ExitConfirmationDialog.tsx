
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ExitConfirmationDialogProps {
  isOpen: boolean
  message: string
  pendingId?: string
  token?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ExitConfirmationDialog = ({
  isOpen,
  message,
  pendingId,
  token,
  onConfirm,
  onCancel,
}: ExitConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exit Confirmation</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="my-4 text-sm">
          <div className="flex justify-between items-center mb-2">
            <strong className="text-gray-600">Pending ID:</strong>
            <span className="font-mono bg-gray-100 p-1 rounded">{pendingId || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-gray-600">Token:</strong>
            <span className="font-mono bg-gray-100 p-1 rounded break-all">{token || 'N/A'}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            NO
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            YES
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
