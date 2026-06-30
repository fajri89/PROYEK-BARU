"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function AdminLogin({ className }: { className?: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // use the shared singleton client via hook
  const supabase = useSupabase()

  async function refreshUser() {
    try {
      const { data } = await supabase.auth.getUser()
      setUserEmail(data.user?.email ?? null)
    } catch (err) {
      console.error("[v0] Error refreshing user:", err)
      setUserEmail(null)
    }
  }

  useEffect(() => {
    refreshUser()
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      refreshUser()
    })
    return () => {
      subscription.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      setEmail("")
      setPassword("")
    } catch (err: any) {
      setError(err?.message ?? "Gagal login. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  async function onLogout() {
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error("[v0] Error logging out:", err)
      setError("Gagal logout. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("w-full rounded-xl border border-border/50 p-6 bg-gradient-to-br from-card to-secondary shadow-lg", className)}>
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-4">Akses Admin</h2>

      {userEmail ? (
        <div className="flex items-center justify-between bg-green-900/30 rounded-lg p-4 border border-green-800/50">
          <div>
            <p className="text-sm text-muted-foreground">Akun yang aktif</p>
            <p className="text-base font-semibold text-foreground">{userEmail}</p>
          </div>
          <Button variant="outline" onClick={onLogout} disabled={loading} className="whitespace-nowrap">
            Keluar
          </Button>
        </div>
      ) : (
        <form onSubmit={onLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-base font-semibold text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="admin@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2 text-base bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-base font-semibold text-foreground">Kata sandi</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="py-2 text-base bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {error ? <p className="text-sm bg-red-900/30 text-red-300 rounded p-3 border border-red-800/50">{error}</p> : null}

          <Button type="submit" disabled={loading} className="shadow-md hover:shadow-lg transition-all duration-200 text-base py-2">
            {loading ? "Memproses..." : "Masuk Sebagai Admin"}
          </Button>
          <p className="text-xs text-muted-foreground bg-blue-900/30 rounded p-3 border border-blue-800/50">
            <span className="font-semibold text-blue-300">Info:</span> Hanya admin yang dapat menambah dan menghapus transaksi. Publik dapat melihat riwayat.
          </p>
        </form>
      )}
    </div>
  )
}
