import { VoucherList } from "@/components/voucher-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Receipt, Plus, LayoutDashboard } from "lucide-react"
import HistorySummary from "@/components/history-summary" // include monthly summary
import { createServerClient } from "@/lib/supabase/server"

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: { outlet?: string; month?: string }
}) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAdmin = user?.app_metadata?.role === "admin"

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Riwayat Voucher</h1>
                <p className="text-xs text-muted-foreground font-medium">Kelola semua transaksi voucher Anda</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              {isAdmin ? (
                <Link href="/">
                  <Button className="gap-2 shadow-md hover:shadow-lg transition-all duration-200">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah</span>
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <div className="space-y-8 animate-fade-in">
          <VoucherList isAdmin={isAdmin} outletFilter={searchParams?.outlet} monthFilter={searchParams?.month} />
          <div className="mt-4">
            <HistorySummary />
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-16 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Voucher Tracker</span> • Sistem manajemen voucher profesional dengan integrasi Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
