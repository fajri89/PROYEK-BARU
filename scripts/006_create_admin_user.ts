/**
 * Usage: Run this script from v0 Scripts. It will create an admin user.
 * It prints the created user's id and email.
 */
const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.log("[v0] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// Default credentials (you can change these after first login)
const ADMIN_EMAIL = "joengkekait3@gmail.com"
const ADMIN_PASSWORD = "@Joeng18031989"

async function main() {
  console.log("[v0] Creating admin user:", ADMIN_EMAIL)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      app_metadata: { role: "admin" },
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.log("[v0] Failed to create admin user:", res.status, JSON.stringify(json))
    process.exit(1)
  }

  console.log("[v0] Admin user created:", JSON.stringify({ id: json.id, email: json.email }, null, 2))
  console.log("[v0] You can now login with:")
  console.log(`[v0] Email: ${ADMIN_EMAIL}`)
  console.log(`[v0] Password: ${ADMIN_PASSWORD}`)
}

main().catch((err) => {
  console.log("[v0] Error:", err?.message)
  process.exit(1)
})
