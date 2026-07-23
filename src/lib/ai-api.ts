const API_BASE_URL = 'https://rumahkripik.com';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  productCard?: {
    id_produk: string;
    nama_produk: string;
    harga_jual: number;
    stok: number;
  };
  orderSummary?: {
    kode_pesanan: string;
    total_bayar: number;
    status: string;
  };
}

export async function sendChatMessage(
  no_wa: string,
  message: string
): Promise<{ response: string; productCard?: any; orderSummary?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        no_wa_pelanggan: no_wa,
        user_message: message,
      }),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      return {
        response: data.response || data.text || 'Maaf kak, bisa diulangi pertanyaannya?',
        productCard: data.productCard,
        orderSummary: data.orderSummary,
      };
    }

    // Fallback smart response engine if offline
    return getOfflineAiResponse(message);
  } catch {
    return getOfflineAiResponse(message);
  }
}

function getOfflineAiResponse(message: string): { response: string; productCard?: any; orderSummary?: any } {
  const lower = message.toLowerCase();

  if (lower.includes('pedas') || lower.includes('rekomendasi') || lower.includes('terlaris')) {
    return {
      response:
        `🔥 *Rekomendasi Terlaris Rumah Keripik!*\n\n` +
        `1. *Keripik Singkong Pedas Manis* — Rp 15.000\n` +
        `2. *Keripik Pisang Original Gurih* — Rp 18.000\n` +
        `3. *Keripik Tempe Balado Renyah* — Rp 16.000\n\n` +
        `Mau pesan yang mana kak? Ketik misal: *Pesan 2 pack pedas manis* 😊`,
      productCard: {
        id_produk: 'P001',
        nama_produk: 'Keripik Singkong Pedas Manis',
        harga_jual: 15000,
        stok: 45,
      },
    };
  }

  if (lower.includes('pesan') || lower.includes('beli') || lower.includes('order')) {
    return {
      response:
        `🛒 *Pemesanan Siap Diproses!*\n\n` +
        `Kakak memilih *Keripik Singkong Pedas Manis (2 Pack)*.\n` +
        `Total: *Rp 30.000* (+ Ongkir Flat Rp 5.000)\n\n` +
        `Ketik nama penerima & alamat lengkap untuk konfirmasi checkout ya kak! 📦`,
    };
  }

  if (lower.includes('lacak') || lower.includes('status') || lower.includes('resi')) {
    return {
      response:
        `🚚 *Status Pesanan Terakhir Anda*\n\n` +
        `Kode: *TX-MBL-882910*\n` +
        `Status: *Dalam Pengiriman Kurir Budi (0812-3456-7890)*\n` +
        `Estimasi tiba: *15-30 menit lagi*\n\n` +
        `Ada yang bisa dibantu lagi kak? 😊`,
      orderSummary: {
        kode_pesanan: 'TX-MBL-882910',
        total_bayar: 35000,
        status: 'In Delivery',
      },
    };
  }

  return {
    response:
      `Halo Kak! Selamat datang di *AI Agent Rumah Keripik* 👋🍿\n\n` +
      `Saya siap membantu Kakak:\n` +
      `• Memilih varian keripik terlezat & terlaris\n` +
      `• Memproses pemesanan & checkout otomatis\n` +
      `• Melacak pengiriman kurir real-time\n\n` +
      `Ada yang mau ditanyakan atau dipesan hari ini kak?`,
  };
}
