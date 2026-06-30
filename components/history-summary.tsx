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
      <Card className="shadow-lg border-border/50">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Menghitung ringkasan per outlet per bulan...</p>
        </CardContent>
      </Card>
    )
  }

  if (needsSetup) {
    return <DatabaseSetupGuide />
  }

  if (error) {
    return (
      <Card className="shadow-lg border-border/50">
        <CardContent className="py-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Pastikan Supabase sudah terhubung dan semua skrip migrasi sudah dijalankan.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (vouchers.length === 0) return null

  return (
    <div className="space-y-6">
      {sortedMonths.map((mk) => {
        const outlets = grouped.get(mk)!
        const monthTotal = Array.from(outlets.values()).reduce((a, b) => a + b, 0)
        return (
          <Card key={mk} className="shadow-lg border-border/50 overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 border-b border-border/50 pb-4">
              <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Ringkasan Bulan {formatMonthLabel(mk)}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-border/50 hover:bg-transparent">
                      <TableHead className="w-[50%] font-bold text-base text-foreground">Outlet</TableHead>
                      <TableHead className="text-right font-bold text-base text-foreground">Total Penjualan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(outlets.entries())
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([outlet, total]) => (
                        <TableRow key={outlet} className="hover:bg-secondary/50 transition-colors duration-200">
                          <TableCell className="font-semibold text-foreground">
                            <Link
                              href={`/history?outlet=${encodeURIComponent(outlet)}&month=${mk}`}
                              className="text-primary hover:text-blue-700 dark:hover:text-blue-400 underline underline-offset-2 transition-colors duration-200"
                            >
                              {outlet}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">{formatRupiah(total)}</TableCell>
                        </TableRow>
                      ))}
                    <TableRow className="bg-gradient-to-r from-primary/10 to-blue-600/10 hover:bg-gradient-to-r hover:from-primary/15 hover:to-blue-600/15 border-t-2 border-border/50">
                      <TableCell className="font-bold text-base text-foreground">Total Semua Outlet</TableCell>
                      <TableCell className="text-right font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">{formatRupiah(monthTotal)}</TableCell>
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
