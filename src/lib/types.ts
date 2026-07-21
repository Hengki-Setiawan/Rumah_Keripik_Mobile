export type ChatRole = 'user' | 'assistant' | 'admin' | 'system' | 'tool';

export type ChatComponent =
  | ProductCardsComponent
  | QuickRepliesComponent
  | CartSummaryComponent
  | CustomerConfirmComponent
  | AddressConfirmComponent
  | LocationPickerComponent
  | PaymentMethodsComponent
  | PaymentUploadComponent
  | OrderSummaryComponent
  | OrderStatusComponent
  | AdminHandoffComponent;

export type ProductCardsComponent = {
  type: 'product_cards';
  productIds: string[];
  reason?: string;
  layout?: 'horizontal' | 'grid';
  actions?: Array<'add_to_cart' | 'view_detail' | 'choose_package'>;
};

export type QuickRepliesComponent = {
  type: 'quick_replies';
  options: Array<{
    id: string;
    label: string;
    value: string;
    action: 'send_message' | 'tool_action';
  }>;
};

export type CartSummaryComponent = { type: 'cart_summary'; cartId: string };

export type CustomerConfirmComponent = {
  type: 'customer_confirm';
  customerId?: string;
  maskedFields?: true;
  customer?: MaskedCustomerSummary;
  actions?: string[];
};

export type AddressConfirmComponent = {
  type: 'address_confirm';
  addressId?: number;
  address?: AddressSummary;
  actions?: string[];
};

export type LocationPickerComponent = {
  type: 'location_picker';
  mode: 'current_location' | 'manual_pick' | 'both';
  addressDraftId?: string;
};

export type PaymentMethodsComponent = {
  type: 'payment_methods';
  orderId?: string;
  methodIds: string[];
};

export type PaymentUploadComponent = {
  type: 'payment_upload';
  orderId: string;
  statusToken?: string;
  allowedTypes?: Array<'image/jpeg' | 'image/png' | 'application/pdf'>;
  maxSizeMb?: number;
  qrCodeUrl?: string | null;
  amount?: number;
};

export type OrderSummaryComponent = {
  type: 'order_summary';
  orderDraftId: string;
  paymentMethodId?: string;
  savedCustomerId?: string;
  savedAddressId?: number;
  actions?: Array<'confirm_order' | 'edit_cart' | 'edit_address'>;
};

export type OrderStatusComponent = {
  type: 'order_status_card';
  orderId: string;
  orderCode?: string | null;
  status?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  totalAmount?: number;
};

export type AdminHandoffComponent = {
  type: 'admin_handoff_card';
  reason?: string;
};

export type ChatMessageDto = {
  id: string;
  role: ChatRole;
  content: string;
  components: ChatComponent[];
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ChatCartItemDto = {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  stock: number;
  imageUrl?: string | null;
};

export type ChatCartDto = {
  id: string;
  items: ChatCartItemDto[];
  total: number;
  itemCount: number;
};

export type MaskedCustomerSummary = {
  id: string;
  name: string | null;
  phoneMasked: string | null;
  tags?: string[];
};

export type AddressSummary = {
  id: number;
  label: string | null;
  recipientName: string | null;
  phoneMasked: string | null;
  addressSummary: string;
  latitude?: string | null;
  longitude?: string | null;
  isDefault?: boolean;
};

export type CustomerMemorySummary = {
  id: string;
  key: string;
  value: string;
  confidence: number;
  source: 'chat' | 'order' | 'admin' | 'system';
  visibility: 'ai' | 'admin' | 'both';
  reviewedByAdmin: boolean;
};

export type CustomerContextDto = {
  customer: MaskedCustomerSummary | null;
  addresses: AddressSummary[];
  defaultAddress: AddressSummary | null;
  memory?: CustomerMemorySummary[];
  lastOrder?: {
    id: string;
    code: string | null;
    status: string;
    paymentStatus: string;
    totalAmount: number;
  } | null;
};

export type ChatSessionSummary = {
  id: string;
  title: string | null;
  status: string;
  updatedAt: string;
};

export type ProductDto = {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  description: string | null;
  categoryName?: string | null;
  variants: Array<{ id: string; name: string; price: number; stock: number; imageUrl?: string | null }>;
};

export type PaymentMethodDto = {
  id: string;
  type: string;
  label: string;
  note?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
};

export type CustomerProfileDto = {
  id: string;
  nama: string | null;
  phone: string | null;
  email: string | null;
};

export type SavedAddressDto = {
  id: number;
  label: string | null;
  recipientName: string | null;
  phone: string | null;
  addressText: string;
  landmark: string | null;
  courierNote: string | null;
  latitude: string | null;
  longitude: string | null;
  isDefault: number;
};

export type OrderDto = {
  idTransaksi: string;
  kodePesanan: string | null;
  totalBayar: number;
  statusPembayaran: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string | null;
  namaPenerima: string | null;
  phonePenerima: string | null;
  alamatPenerima: string | null;
  waktuSimpan: string;
  updatedAt: string;
  statusToken: string | null;
};

export type OrderTrackResponse = {
  order: {
    id_transaksi: string;
    kode_pesanan: string | null;
    total_bayar: number;
    status_pembayaran: string;
    order_status: string;
    payment_status: string;
    payment_method: string | null;
    nama_penerima: string | null;
    alamat_penerima: string | null;
    waktu_simpan: string;
    status_token: string | null;
  };
  customer?: { nama: string | null; phone: string | null } | null;
  items: Array<{
    id_produk: string;
    nama_produk: string | null;
    qty: number;
    harga: number;
    subtotal: number;
  }>;
  events: Array<{
    id: string;
    event_type: string;
    event_data: string | null;
    created_at: string;
  }>;
  courier?: {
    name: string;
    vehicle: string | null;
    plat_no: string | null;
    lat: number | null;
    lng: number | null;
    last_location_at: string | null;
  } | null;
  delivery_status?: string | null;
};

export type ApiResponse<T = unknown> = {
  ok: boolean;
  error?: string;
} & T;
