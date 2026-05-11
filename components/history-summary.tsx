"use client"

import { useEffect, useMemo, useState } from "react"
import { getVouchers, type VoucherRecord } from "@/lib/storage"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import DatabaseSetupGuide from "./database-setup-guide"

type MonthKey = string // "YYYY-MM"

function monthKeyOf(dateStr: string): MonthKey {
  // dateStr "YYYY-MM-DD"
  const [y, m] = dateStr.split("-")
  return `${y}-${m}`
}

function formatMonthLabel(key: MonthKey): string {
  const [y, m] = key.split("-").map((v) => Number(v))
  const date = new Date(y, m - 1 || 0, 1)
  return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" })
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`
}

export default function HistorySummary() {
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setError(null)
      setNeedsSetup(false)
      try {
        console.log("[v0] Fetching vouchers for summary...")
        const data = await getVouchers(supabase)
        console.log("[v0] Successfully fetched", data.length, "vouchers")
        setVouchers(data)
      } catch (err) {
        console.error("[v0] Error loading vouchers for summary:", err)
        const errorMessage = err instanceof Error ? err.message : "Gagal memuat data ringkasan."
        setError(errorMessage)
        if (
          errorMessage.includes("vouchers") ||
          errorMessage.includes("42P01") ||
          errorMessage.includes("Failed to fetch")
        ) {
          setNeedsSetup(true)
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const grouped = useMemo(() => {
    // Structure: { [monthKey]: { [outletName]: totalHarga } }
    const map = new Map<MonthKey, Map<string, number>>()
    for (const v of vouchers) {
      const mk = monthKeyOf(v.tanggal)
      if (!map.has(mk)) map.set(mk, new Map())
      const outletTotals = map.get(mk)!
      outletTotals.set(v.namaOutlet, (outletTotals.get(v.namaOutlet) || 0) + v.totalHarga)
    }
    return map
  }, [vouchers])

  const sortedMonths = useMemo(() => {
    return Array.from(grouped.keys()).sort((a, b) => (a < b ? 1 : -1)) // latest first
  }, [grouped])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Menghitung ringkasan per outlet per bulan...
        </CardContent>
      </Card>
    )
  }

  if (needsSetup) {
    return <DatabaseSetupGuide />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pastikan Supabase sudah terhubung dan semua skrip migrasi sudah dijalankan.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (vouchers.length === 0) return null

  return (
    <div className="space-y-8">
      {sortedMonths.map((mk) => {
        const outlets = grouped.get(mk)!
        const monthTotal = Array.from(outlets.values()).reduce((a, b) => a + b, 0)
        return (
          <Card key={mk}>
            <CardHeader>
              <CardTitle className="text-lg">Rekap Bulan {formatMonthLabel(mk)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Outlet</TableHead>
                      <TableHead className="text-right">Total Penjualan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(outlets.entries())
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([outlet, total]) => (
                        <TableRow key={outlet}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/history?outlet=${encodeURIComponent(outlet)}&month=${mk}`}
                              className="underline underline-offset-4 hover:text-primary"
                            >
                              {outlet}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">{formatRupiah(total)}</TableCell>
                        </TableRow>
                      ))}
                    <TableRow>
                      <TableCell className="font-semibold">Total Semua Outlet (Bulan ini)</TableCell>
                      <TableCell className="text-right font-semibold">{formatRupiah(monthTotal)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
