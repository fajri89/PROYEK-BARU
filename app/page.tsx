import { VoucherForm } from "@/components/voucher-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Receipt, History } from "lucide-react"
import AdminLogin from "@/components/admin-login"
import HistorySummary from "@/components/history-summary"
import { createServerClient } from "@/lib/supabase/server"

export default async function Home() {
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
                <h1 className="text-xl font-bold">Voucher Tracker</h1>
                <p className="text-sm text-muted-foreground">Sistem Pencatatan Voucher AZWAR-NET</p>
              </div>
            </div>
            <Link href="/history">
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Riwayat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AdminLogin className="mb-8" />
        <div className="mb-8">
          <HistorySummary />
        </div>
        {isAdmin ? <VoucherForm /> : null}
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Voucher Tracker App • Data tersimpan di Supabase</p>
        </div>
      </footer>
    </div>
  )
}
