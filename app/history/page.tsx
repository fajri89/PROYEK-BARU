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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Riwayat Voucher</h1>
                <p className="text-sm text-muted-foreground">Daftar semua voucher yang tersimpan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </Link>
              {isAdmin ? (
                <Link href="/">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Baru
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <VoucherList isAdmin={isAdmin} outletFilter={searchParams?.outlet} monthFilter={searchParams?.month} />
        <div className="mt-10">
          <HistorySummary />
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Voucher Tracker App • Data tersimpan di Supabase</p>
        </div>
      </footer>
    </div>
  )
}
