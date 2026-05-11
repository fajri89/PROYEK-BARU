"use client"

import { useEffect, useState } from "react"
import { type VoucherRecord, getVouchers, deleteVoucher } from "@/lib/storage"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Trash2, Receipt } from "lucide-react"
import { printReceipt, downloadReceiptAsPDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
  isAdmin?: boolean
  outletFilter?: string
  monthFilter?: string // "YYYY-MM"
}

function monthKeyOf(dateStr: string): string {
  const [y, m] = dateStr.split("-")
  return `${y}-${m}`
}

export function VoucherList({ isAdmin = false, outletFilter, monthFilter }: Props) {
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadVouchers()
  }, [])

  const loadVouchers = async () => {
    try {
      setIsLoading(true)
      const data = await getVouchers(supabase)
      let sorted = data.sort((a, b) => b.createdAt - a.createdAt)
      if (outletFilter) {
        sorted = sorted.filter((v) => v.namaOutlet === outletFilter)
      }
      if (monthFilter) {
        sorted = sorted.filter((v) => monthKeyOf(v.tanggal) === monthFilter)
      }
      setVouchers(sorted)
    } catch (error) {
      console.error("Error loading vouchers:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data voucher dari Supabase.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVoucher(id, supabase)
      await loadVouchers()
      toast({
        title: "Berhasil",
        description: "Data voucher berhasil dihapus dari Supabase.",
      })
    } catch (error) {
      console.error("Error deleting voucher:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus data voucher.",
        variant: "destructive",
      })
    }
  }

  const handlePrint = (voucher: VoucherRecord) => {
    printReceipt(voucher)
    toast({
      title: "Mencetak...",
      description: "Jendela print akan terbuka.",
    })
  }

  const handleDownload = (voucher: VoucherRecord) => {
    downloadReceiptAsPDF(voucher)
    toast({
      title: "Berhasil",
      description: "Struk berhasil diunduh.",
    })
  }

  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Memuat data dari Supabase...</p>
        </CardContent>
      </Card>
    )
  }

  if (vouchers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Belum ada data voucher</p>
          <p className="text-sm text-muted-foreground mt-2">Mulai tambahkan data voucher pertama Anda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {vouchers.map((voucher) => (
        <Card key={voucher.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{voucher.jenisVoucher}</CardTitle>
                <CardDescription>
                  {voucher.namaOutlet} • {voucher.tanggal} {voucher.waktu}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono">
                {voucher.nomorStruk}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah:</span>
                    <span className="font-medium">{voucher.jumlah} pcs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Satuan:</span>
                    <span className="font-medium">{formatRupiah(voucher.hargaSatuan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold text-lg">{formatRupiah(voucher.totalHarga)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pembayaran:</span>
                    <span className="font-medium">{voucher.metodePembayaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kasir:</span>
                    <span className="font-medium">{voucher.kasir}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alamat:</span>
                    <span className="font-medium text-right">{voucher.alamatOutlet}</span>
                  </div>
                </div>
              </div>

              {voucher.catatan && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Catatan:</span> {voucher.catatan}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="default" onClick={() => handlePrint(voucher)} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(voucher)}>
                  <Download className="h-4 w-4 mr-2" />
                  Unduh
                </Button>
                {isAdmin ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Voucher?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Data voucher ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(voucher.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
