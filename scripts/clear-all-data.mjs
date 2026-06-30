#!/usr/bin/env node

/**
 * Script untuk menghapus semua data voucher dari Supabase
 * Gunakan: node scripts/clear-all-data.mjs
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak tersedia");
  console.error("Pastikan kedua variabel tersebut sudah di-set di .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllData() {
  console.log("🗑️  Menghapus semua data voucher...");
  console.log("⚠️  Tindakan ini tidak dapat dibatalkan!");

  try {
    // Get total count first
    const { count } = await supabase
      .from("vouchers")
      .select("*", { count: "exact", head: true });

    console.log(`📊 Total data yang akan dihapus: ${count || 0} records`);

    if (count === 0) {
      console.log("✅ Database sudah kosong, tidak ada yang perlu dihapus");
      return;
    }

    // Delete all vouchers
    const { error } = await supabase
      .from("vouchers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      throw error;
    }

    console.log("✅ Semua data voucher berhasil dihapus!");
    console.log("✨ Database sekarang kosong dan siap untuk data baru");
  } catch (error) {
    console.error("❌ Error saat menghapus data:", error.message);
    process.exit(1);
  }
}

clearAllData();
