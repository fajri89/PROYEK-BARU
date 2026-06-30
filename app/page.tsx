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
      <header className="sticky top-0 z-50 bg-card border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Voucher Tracker</h1>
                <p className="text-xs text-muted-foreground font-medium">AZWAR-NET Management System</p>
              </div>
            </div>
            <Link href="/history">
              <Button className="gap-2 shadow-md hover:shadow-lg transition-all duration-200">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Riwayat</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <div className="space-y-6">
          <AdminLogin className="animate-fade-in" />
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <HistorySummary />
          </div>
          {isAdmin ? (
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <VoucherForm />
            </div>
          ) : null}
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
