import { SalesInvoice, PurchaseInvoice } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceDetailsDialogProps {
  invoice: SalesInvoice | PurchaseInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "sales" | "purchase";
}

const InvoiceDetailsDialog = ({
  invoice,
  open,
  onOpenChange,
  type,
}: InvoiceDetailsDialogProps) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-right">
            {type === "sales" ? "تفاصيل فاتورة البيع" : "تفاصيل فاتورة الشراء"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Invoice Date */}
          <div className="bg-muted p-3 rounded-lg text-right">
            <p className="text-sm text-muted-foreground">تاريخ الفاتورة</p>
            <p className="font-medium">
              {new Date(invoice.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-semibold mb-2 text-right">المنتجات</h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-right">الإجمالي</th>
                    <th className="p-2 text-right">السعر</th>
                    <th className="p-2 text-right">الكمية</th>
                    <th className="p-2 text-right">المنتج</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-2 text-right font-medium text-primary">
                        {item.total.toFixed(2)}
                      </td>
                      <td className="p-2 text-right">{item.price.toFixed(2)}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{item.productName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Total */}
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">إجمالي الفاتورة</p>
            <p className="text-2xl font-bold text-primary">
              {invoice.total.toFixed(2)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
