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
      <Card className="shadow-lg border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Memuat data dari Supabase...</p>
        </CardContent>
      </Card>
    )
  }

  if (vouchers.length === 0) {
    return (
      <Card className="shadow-lg border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-secondary p-6 mb-4">
            <Receipt className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">Belum ada data voucher</p>
          <p className="text-sm text-muted-foreground mt-2">Mulai tambahkan data voucher pertama Anda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {vouchers.map((voucher) => (
        <Card key={voucher.id} className="shadow-md hover:shadow-lg border-border/50 transition-all duration-300 hover:border-primary/30">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">{voucher.jenisVoucher}</CardTitle>
                <CardDescription className="text-base">
                  <span className="font-semibold text-foreground">{voucher.namaOutlet}</span> • {voucher.tanggal} • {voucher.waktu}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono bg-primary/10 text-primary hover:bg-primary/20 ml-4">
                {voucher.nomorStruk}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3 bg-secondary/40 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Jumlah</span>
                    <span className="font-semibold text-lg">{voucher.jumlah} <span className="text-sm text-muted-foreground">pcs</span></span>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Harga Satuan</span>
                    <span className="font-semibold">{formatRupiah(voucher.hargaSatuan)}</span>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground font-medium">Total</span>
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">{formatRupiah(voucher.totalHarga)}</span>
                  </div>
                </div>
                <div className="space-y-3 bg-secondary/40 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Pembayaran</span>
                    <Badge className="bg-accent text-accent-foreground">{voucher.metodePembayaran}</Badge>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Kasir</span>
                    <span className="font-semibold">{voucher.kasir}</span>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between items-start pt-2">
                    <span className="text-muted-foreground font-medium">Alamat</span>
                    <span className="font-medium text-right text-sm">{voucher.alamatOutlet}</span>
                  </div>
                </div>
              </div>

              {voucher.catatan && (
                <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-yellow-300">Catatan:</span> <span className="text-muted-foreground">{voucher.catatan}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button size="sm" onClick={() => handlePrint(voucher)} className="flex-1 shadow-sm hover:shadow-md transition-all duration-200 gap-2">
                  <Printer className="h-4 w-4" />
                  Cetak Struk
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(voucher)} className="gap-2">
                  <Download className="h-4 w-4" />
                  Unduh
                </Button>
                {isAdmin ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="gap-2">
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
