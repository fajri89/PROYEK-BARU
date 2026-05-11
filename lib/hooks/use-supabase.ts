"use client"

import { useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * Custom hook to get the Supabase client instance.
 * Ensures a single client instance is reused across all components.
 */
export function useSupabase() {
  return useMemo(() => createClient(), [])
}
