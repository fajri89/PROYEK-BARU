import type { VoucherRecord } from "./storage"

export function generateAzwarNetReceipt(voucher: VoucherRecord): string {
  const width = 80 // 80mm thermal paper width
  const line = "=".repeat(48)
  const dashes = "-".repeat(48)

  // Format currency
  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`
  }

  // Center text
  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((48 - text.length) / 2))
    return " ".repeat(padding) + text
  }

  // Right align with label
  const rightAlign = (label: string, value: string, width = 48) => {
    const combined = label + value
    const padding = Math.max(0, width - combined.length)
    return label + " ".repeat(padding) + value
  }

  const receipt = `
${center("AZWAR-NET")}
${center(voucher.namaOutlet)}
${center(voucher.alamatOutlet)}
${line}
${center("STRUK PEMBELIAN VOUCHER")}
${line}

No. Struk  : ${voucher.nomorStruk}
Tanggal    : ${voucher.tanggal}
Waktu      : ${voucher.waktu}
Kasir      : ${voucher.kasir}

${dashes}
ITEM PEMBELIAN
${dashes}

${voucher.jenisVoucher}
Jumlah     : ${voucher.jumlah} pcs
Harga      : ${formatRupiah(voucher.hargaSatuan)}
${rightAlign("Subtotal:", formatRupiah(voucher.totalHarga))}

${dashes}
${rightAlign("TOTAL:", formatRupiah(voucher.totalHarga))}
${dashes}

Pembayaran : ${voucher.metodePembayaran}
${rightAlign("Bayar:", formatRupiah(voucher.totalHarga))}
${rightAlign("Kembali:", "Rp 0")}

${line}
${center("pelanggan azwar-net.")}
${center("akses internet menjadi lebih cepat")}
${center("dan stabil menggunakan layanan")}
${center("hotspot dari azwar net...")}
${line}

${voucher.catatan ? `Catatan: ${voucher.catatan}\n${line}\n` : ""}
${center(new Date(voucher.createdAt).toLocaleString("id-ID"))}
${center(voucher.id)}
`

  return receipt
}

export function printReceipt(voucher: VoucherRecord): void {
  const receipt = generateAzwarNetReceipt(voucher)
  const printWindow = window.open("", "_blank")

  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Voucher - ${voucher.nomorStruk}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 10mm;
              width: 80mm;
              background: white;
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            @media print {
              body {
                padding: 5mm;
              }
            }
          </style>
        </head>
        <body>
          <pre>${receipt}</pre>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }
}

export function downloadReceiptAsPDF(voucher: VoucherRecord): void {
  const receipt = generateAzwarNetReceipt(voucher)
  const blob = new Blob([receipt], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `struk-${voucher.nomorStruk}-${voucher.tanggal}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
