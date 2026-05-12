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
    <div className="min-h-screen bg-primary">
      <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/30">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-[900] text-white">Voucher Tracker</h1>
                <p className="text-sm text-white/60">Sistem Pencatatan Voucher AZWAR-NET</p>
              </div>
            </div>
            <Link href="/history">
              <Button variant="outline" className="backdrop-blur-xl bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-2xl">
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

      <footer className="backdrop-blur-xl bg-white/10 border-t border-white/20 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-white/60">
          <p>Voucher Tracker App • Data tersimpan di Supabase</p>
        </div>
      </footer>
    </div>
  )
}
