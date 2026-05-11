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
  id: string
  date: string
  time: string
  store_name: string
  store_address: string | null
  voucher_type: string
  quantity: number
  price_per_voucher: number
  total_price: number
  payment_method: string
  receipt_number: string | null
  cashier_name: string | null
  notes: string | null
  created_at: string
}

export async function saveVoucher(
  voucher: Omit<VoucherRecord, "id" | "createdAt">,
  supabase: SupabaseClient,
): Promise<VoucherRecord> {

  const { data, error } = await supabase
    .from("vouchers")
    .insert({
      date: voucher.tanggal,
      time: voucher.waktu,
      store_name: voucher.namaOutlet,
      store_address: voucher.alamatOutlet,
      voucher_type: voucher.jenisVoucher,
      quantity: voucher.jumlah,
      price_per_voucher: voucher.hargaSatuan,
      total_price: voucher.totalHarga,
      payment_method: voucher.metodePembayaran,
      receipt_number: voucher.nomorStruk || null,
      cashier_name: voucher.kasir || null,
      notes: voucher.catatan || null,
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
    id: db.id,
    tanggal: db.date,
    waktu: db.time,
    namaOutlet: db.store_name,
    alamatOutlet: db.store_address || "",
    jenisVoucher: db.voucher_type,
    jumlah: db.quantity,
    hargaSatuan: db.price_per_voucher,
    totalHarga: db.total_price,
    metodePembayaran: db.payment_method,
    nomorStruk: db.receipt_number || "",
    kasir: db.cashier_name || "",
    catatan: db.notes || undefined,
    createdAt: new Date(db.created_at).getTime(),
  }
}
