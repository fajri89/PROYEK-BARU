"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { saveVoucher } from "@/lib/storage"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { OUTLETS } from "@/lib/outlets" // use centralized outlet list

const VOUCHER_PRICES: Record<string, number> = {
  "Voucher 2000": 1750,
  "Voucher 3000": 2500,
  "Voucher 5000": 4250,
}

export function VoucherForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [namaOutletValue, setNamaOutletValue] = useState("")
  const [jenisVoucherValue, setJenisVoucherValue] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      // client-side validation
      if (!namaOutletValue) {
        throw new Error("Nama outlet wajib dipilih.")
      }
      if (!jenisVoucherValue) {
        throw new Error("Jenis voucher wajib dipilih.")
      }

      await saveVoucher(
        {
          tanggal: formData.get("tanggal") as string,
          waktu: formData.get("waktu") as string,
          // read from controlled state instead of FormData for Selects
          namaOutlet: namaOutletValue,
          alamatOutlet: formData.get("alamatOutlet") as string,
          jenisVoucher: jenisVoucherValue,
          jumlah: Number.parseInt(formData.get("jumlah") as string),
          hargaSatuan: Number.parseInt(formData.get("hargaSatuan") as string),
          totalHarga: Number.parseInt(formData.get("totalHarga") as string),
          metodePembayaran: formData.get("metodePembayaran") as string,
          nomorStruk: formData.get("nomorStruk") as string,
          kasir: formData.get("kasir") as string,
          catatan: (formData.get("catatan") as string) || undefined,
        },
        supabase,
      )

      toast({
        title: "Berhasil!",
        description: "Data voucher berhasil disimpan ke Supabase.",
      })

      router.push("/history")
    } catch (error: any) {
      console.error("Error saving voucher:", error)
      toast({
        title: "Error",
        description: `Gagal menyimpan data voucher. ${error?.message || "Pastikan Supabase sudah dikonfigurasi."}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOutletChange = (value: string) => {
    setNamaOutletValue(value)
    const form = document.querySelector("form") as HTMLFormElement
    const alamatOutletInput = form?.alamatOutlet as HTMLInputElement
    const selected = OUTLETS.find((o) => o.name === value)
    if (alamatOutletInput && selected) {
      alamatOutletInput.value = selected.address
    }
  }

  const handleVoucherTypeChange = (value: string) => {
    setJenisVoucherValue(value)
    const form = document.querySelector("form") as HTMLFormElement
    const hargaSatuanInput = form?.hargaSatuan as HTMLInputElement
    const jumlahInput = form?.jumlah as HTMLInputElement
    const totalInput = form?.totalHarga as HTMLInputElement

    if (hargaSatuanInput && VOUCHER_PRICES[value]) {
      hargaSatuanInput.value = VOUCHER_PRICES[value].toString()
      const jumlah = Number.parseInt(jumlahInput?.value) || 0
      if (totalInput && jumlah > 0) {
        totalInput.value = (jumlah * VOUCHER_PRICES[value]).toString()
      }
    }
  }

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const jumlah = Number.parseInt(e.target.value) || 0
    const hargaSatuan = Number.parseInt((e.target.form?.hargaSatuan as HTMLInputElement)?.value) || 0
    const totalInput = e.target.form?.totalHarga as HTMLInputElement
    if (totalInput) {
      totalInput.value = (jumlah * hargaSatuan).toString()
    }
  }

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hargaSatuan = Number.parseInt(e.target.value) || 0
    const jumlah = Number.parseInt((e.target.form?.jumlah as HTMLInputElement)?.value) || 0
    const totalInput = e.target.form?.totalHarga as HTMLInputElement
    if (totalInput) {
      totalInput.value = (jumlah * hargaSatuan).toString()
    }
  }

  // Set default date and time
  const now = new Date()
  const defaultDate = now.toISOString().split("T")[0]
  const defaultTime = now.toTimeString().slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Data Voucher</CardTitle>
        <CardDescription>Masukkan detail pembelian voucher dari AZWAR-NET</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input id="tanggal" name="tanggal" type="date" defaultValue={defaultDate} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waktu">Waktu</Label>
              <Input id="waktu" name="waktu" type="time" defaultValue={defaultTime} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="namaOutlet">Nama Outlet</Label>
            {/* Hidden input ensures value is posted with the form */}
            <input type="hidden" name="namaOutlet" value={namaOutletValue} />
            <Select value={namaOutletValue} onValueChange={handleOutletChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih nama outlet" />
              </SelectTrigger>
              <SelectContent>
                {OUTLETS.map((o) => (
                  <SelectItem key={o.name} value={o.name}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamatOutlet">Alamat Outlet</Label>
            <Input id="alamatOutlet" name="alamatOutlet" placeholder="Alamat terisi otomatis" readOnly required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenisVoucher">Jenis Voucher</Label>
            {/* Hidden input ensures value is posted with the form */}
            <input type="hidden" name="jenisVoucher" value={jenisVoucherValue} />
            <Select value={jenisVoucherValue} onValueChange={handleVoucherTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis voucher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Voucher 2000">Voucher 2000</SelectItem>
                <SelectItem value="Voucher 3000">Voucher 3000</SelectItem>
                <SelectItem value="Voucher 5000">Voucher 5000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah</Label>
              <Input
                id="jumlah"
                name="jumlah"
                type="number"
                min="1"
                placeholder="1"
                onChange={handleJumlahChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hargaSatuan">Harga Satuan (Rp)</Label>
              <Input
                id="hargaSatuan"
                name="hargaSatuan"
                type="number"
                min="0"
                placeholder="50000"
                onChange={handleHargaChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalHarga">Total Harga (Rp)</Label>
              <Input
                id="totalHarga"
                name="totalHarga"
                type="number"
                min="0"
                placeholder="50000"
                readOnly
                className="bg-muted"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodePembayaran">Metode Pembayaran</Label>
            <Select name="metodePembayaran" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tunai">Tunai</SelectItem>
                <SelectItem value="Debit">Debit</SelectItem>
                <SelectItem value="Kredit">Kredit</SelectItem>
                <SelectItem value="QRIS">QRIS</SelectItem>
                <SelectItem value="E-Wallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomorStruk">Nomor Struk</Label>
              <Input id="nomorStruk" name="nomorStruk" placeholder="Contoh: 001234567890" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kasir">Nama Kasir</Label>
              <Input id="kasir" name="kasir" placeholder="Contoh: BUDI" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan (Opsional)</Label>
            <Textarea id="catatan" name="catatan" placeholder="Tambahkan catatan jika diperlukan..." rows={3} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Menyimpan..." : "Simpan Voucher"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/history")}>
              Lihat Riwayat
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
