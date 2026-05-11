import type { SupabaseClient } from "@supabase/supabase-js"

export interface VoucherRecord {
  id: string
  tanggal: string
  waktu: string
  namaOutlet: string
  alamatOutlet: string
  jenisVoucher: string
  jumlah: number
  hargaSatuan: number
  totalHarga: number
  metodePembayaran: string
  nomorStruk: string
  kasir: string
  catatan?: string
  createdAt: number
}

interface VoucherDB {
  id: number
  tanggal: string
  waktu: string
  nama_outlet: string
  alamat_outlet: string | null
  jenis_voucher: string
  jumlah: number
  harga_satuan: number
  total_harga: number
  metode_pembayaran: string
  nomor_struk: string | null
  kasir: string | null
  catatan: string | null
  created_at: number
}

export async function saveVoucher(
  voucher: Omit<VoucherRecord, "id" | "createdAt">,
  supabase: SupabaseClient,
): Promise<VoucherRecord> {

  const { data, error } = await supabase
    .from("vouchers")
    .insert({
      tanggal: voucher.tanggal,
      waktu: voucher.waktu,
      nama_outlet: voucher.namaOutlet,
      alamat_outlet: voucher.alamatOutlet,
      jenis_voucher: voucher.jenisVoucher,
      jumlah: voucher.jumlah,
      harga_satuan: voucher.hargaSatuan,
      total_harga: voucher.totalHarga,
      metode_pembayaran: voucher.metodePembayaran,
      nomor_struk: voucher.nomorStruk || null,
      kasir: voucher.kasir || null,
      catatan: voucher.catatan || null,
    })
    .select()
    .single()

  if (error) throw error

  return mapDBToRecord(data)
}

export async function getVouchers(supabase: SupabaseClient): Promise<VoucherRecord[]> {
  try {
    console.log("[v0] Querying vouchers table...")
    console.log("[v0] Supabase client URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: true })

      clearTimeout(timeoutId)

      if (error) {
        console.error("[v0] Supabase query error:", error)
        if (error.code === "42P01") {
          throw new Error(
            "Tabel 'vouchers' belum dibuat. Silakan jalankan skrip database terlebih dahulu di bagian Setup.",
          )
        }
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("[v0] Query successful, received", data?.length || 0, "records")
      return data.map(mapDBToRecord)
    } catch (fetchErr) {
      clearTimeout(timeoutId)
      if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
        throw new Error("Supabase connection timeout. Project may be paused. Please try again.")
      }
      throw fetchErr
    }
  } catch (err) {
    console.error("[v0] Error in getVouchers:", err)
    throw err
  }
}

export async function deleteVoucher(id: string, supabase: SupabaseClient): Promise<void> {

  const { error } = await supabase.from("vouchers").delete().eq("id", id)

  if (error) throw error
}

export async function getVoucherById(id: string, supabase: SupabaseClient): Promise<VoucherRecord | undefined> {

  const { data, error } = await supabase.from("vouchers").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") return undefined
    throw error
  }

  return mapDBToRecord(data)
}

function mapDBToRecord(db: VoucherDB): VoucherRecord {
  return {
    id: String(db.id),
    tanggal: db.tanggal,
    waktu: db.waktu,
    namaOutlet: db.nama_outlet,
    alamatOutlet: db.alamat_outlet || "",
    jenisVoucher: db.jenis_voucher,
    jumlah: db.jumlah,
    hargaSatuan: db.harga_satuan,
    totalHarga: db.total_harga,
    metodePembayaran: db.metode_pembayaran,
    nomorStruk: db.nomor_struk || "",
    kasir: db.kasir || "",
    catatan: db.catatan || undefined,
    createdAt: db.created_at,
  }
}
