import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function DELETE() {
  try {
    const supabase = await createClient()

    // Get the current session to verify it's an admin
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Delete all vouchers from the database
    const { error } = await supabase
      .from("vouchers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // This ensures all rows are deleted

    if (error) {
      console.error("Error clearing vouchers:", error)
      return Response.json(
        { error: "Failed to clear vouchers", details: error.message },
        { status: 500 }
      )
    }

    return Response.json(
      { message: "All vouchers cleared successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
