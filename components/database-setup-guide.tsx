"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle2 } from "lucide-react"

export default function DatabaseSetupGuide() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-destructive" />
          <CardTitle>Database Belum Siap</CardTitle>
        </div>
        <CardDescription>Anda perlu menjalankan skrip setup database terlebih dahulu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Langkah Setup Database:</strong>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-sm">Buka tab "Setup" di sidebar kiri</p>
              <p className="text-xs text-muted-foreground mt-1">
                Atau scroll ke bagian bawah halaman ini untuk menemukan daftar skrip
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-sm">Jalankan skrip berikut secara berurutan:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1 ml-4">
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">000_enable_extensions.sql</code>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">001_create_vouchers_table.sql</code>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">002_add_outlet_address_and_receipt.sql</code>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">004_public_select_policy.sql</code>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">005_admin_delete_policy.sql</code>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">007_admin_only_insert_policy.sql</code>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">006_create_admin_user.ts</code>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-sm">Refresh halaman setelah semua skrip berhasil</p>
              <p className="text-xs text-muted-foreground mt-1">Aplikasi akan otomatis terhubung ke database</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
