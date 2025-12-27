import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SalesHeader from "@/components/sales/SalesHeader";
import EmptyState from "@/components/sales/EmptyState";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  customerName: string;
  total: number;
  date: Date;
}

const Sales = () => {
  const [invoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const handleNewInvoice = () => {
    toast({
      title: "فاتورة جديدة",
      description: "سيتم فتح نموذج إنشاء فاتورة جديدة",
    });
  };

  return (
    <PageLayout>
      <div className="p-4 space-y-6">
        <SalesHeader total={totalSales} onNewInvoice={handleNewInvoice} />

        {invoices.length === 0 ? (
          <EmptyState
            title="لا توجد فواتير"
            description="ابدأ بإنشاء فاتورة مبيعات جديدة"
          />
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-card p-4 rounded-lg border border-border shadow-sm animate-scale-in"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">
                    {invoice.total.toFixed(2)}
                  </span>
                  <span className="font-medium">{invoice.customerName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Sales;
