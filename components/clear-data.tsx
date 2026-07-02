"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

export function ClearDataButton({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClearData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/clear", {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to clear data")
      }

      // Success - refresh the page or trigger callback
      onSuccess?.()
      window.location.reload()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="w-full gap-2"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Hapus Semua Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Data Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua riwayat penjualan voucher akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={handleClearData}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Menghapus..." : "Hapus Semua Data"}
          </AlertDialogAction>
          <AlertDialogCancel>Batal</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
      {error && (
        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}
