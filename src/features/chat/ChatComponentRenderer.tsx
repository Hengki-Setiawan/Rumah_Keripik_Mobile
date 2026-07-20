import type { ChatCartDto, ChatComponent } from '../../lib/types';
import { ProductCards } from './components/ProductCards';
import { QuickReplies } from './components/QuickReplies';
import { CartSummaryCard } from './components/CartSummaryCard';
import { PaymentMethodsCard } from './components/PaymentMethodsCard';
import { PaymentUploadCard } from './components/PaymentUploadCard';
import { LocationPickerCard } from './components/LocationPickerCard';
import { OrderSummaryCard } from './components/OrderSummaryCard';
import {
  CustomerConfirmCard,
  AddressConfirmCard,
  OrderStatusCard,
  AdminHandoffCard,
} from './components/SimpleCards';

export function ChatComponentRenderer({
  components,
  cart,
  onSend,
  onAction,
}: {
  components: ChatComponent[];
  cart?: ChatCartDto | null;
  onSend: (text: string) => void;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  return (
    <>
      {components.map((comp, index) => {
        switch (comp.type) {
          case 'product_cards':
            return <ProductCards key={index} component={comp} onAction={onAction} />;
          case 'quick_replies':
            return <QuickReplies key={index} options={comp.options} onSend={onSend} onAction={onAction} />;
          case 'cart_summary':
            return <CartSummaryCard key={index} component={comp} cart={cart} onAction={onAction} />;
          case 'payment_methods':
            return <PaymentMethodsCard key={index} component={comp} onAction={onAction} />;
          case 'payment_upload':
            return <PaymentUploadCard key={index} component={comp} onAction={onAction} />;
          case 'location_picker':
            return <LocationPickerCard key={index} component={comp} onSend={onSend} />;
          case 'customer_confirm':
            return <CustomerConfirmCard key={index} component={comp} onAction={onAction} />;
          case 'address_confirm':
            return <AddressConfirmCard key={index} component={comp} onAction={onAction} />;
          case 'order_summary':
            return <OrderSummaryCard key={index} component={comp} onSend={onSend} onAction={onAction} />;
          case 'order_status_card':
            return <OrderStatusCard key={index} component={comp} />;
          case 'admin_handoff_card':
            return <AdminHandoffCard key={index} component={comp} onSend={onSend} />;
          default:
            return null;
        }
      })}
    </>
  );
}
