export type ChatRole = 'user' | 'assistant' | 'admin' | 'system' | 'tool';

export type ChatComponent =
  | ProductCardsComponent
  | QuickRepliesComponent
  | CartSummaryComponent
  | CustomerConfirmComponent
  | AddressConfirmComponent
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
  customer?: MaskedCustomerSummary;
};

export type AddressConfirmComponent = {
  type: 'address_confirm';
  addressId?: number;
  address?: AddressSummary;
};

export type PaymentMethodsComponent = {
  type: 'payment_methods';
  orderId?: string;
  methodIds: string[];
};

export type PaymentUploadComponent = {
  type: 'payment_upload';
  orderId: string;
  qrCodeUrl?: string | null;
  amount?: number;
};

export type OrderSummaryComponent = {
  type: 'order_summary';
  orderDraftId: string;
};

export type OrderStatusComponent = {
  type: 'order_status_card';
  orderId: string;
  orderCode?: string | null;
  status?: string;
  paymentStatus?: string;
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

export type CustomerContextDto = {
  customer: MaskedCustomerSummary | null;
  addresses: AddressSummary[];
  defaultAddress: AddressSummary | null;
};

export type ChatSessionSummary = {
  id: string;
  title: string | null;
  status: string;
  updatedAt: string;
};

export type ApiResponse<T = unknown> = {
  ok: boolean;
  error?: string;
} & T;
