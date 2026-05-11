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
    <div className={cn("w-full max-w-md rounded-lg border p-4 bg-background", className)}>
      <h2 className="text-lg font-semibold mb-3">Login Admin</h2>

      {userEmail ? (
        <div className="flex items-center justify-between">
          <p className="text-sm">
            Masuk sebagai: <span className="font-medium">{userEmail}</span>
          </p>
          <Button variant="secondary" onClick={onLogout} disabled={loading}>
            Keluar
          </Button>
        </div>
      ) : (
        <form onSubmit={onLogin} className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="admin@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="password">Kata sandi</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Hanya admin yang dapat menambah dan menghapus transaksi. Publik tetap dapat melihat riwayat.
          </p>
        </form>
      )}
    </div>
  )
}
