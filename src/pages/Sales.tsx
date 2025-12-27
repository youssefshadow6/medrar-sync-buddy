import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/database";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SalesInvoiceForm from "@/components/sales/SalesInvoiceForm";
import EmptyState from "@/components/sales/EmptyState";

const Sales = () => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const invoices = useLiveQuery(() => 
    db.salesInvoices.orderBy('createdAt').reverse().toArray()
  ) || [];

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const filteredInvoices = invoices.filter((inv) =>
    inv.customerName.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <PageLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>فاتورة جديدة</span>
          </Button>

          <div className="text-right">
            <h2 className="text-2xl font-bold text-foreground">المبيعات</h2>
            <p className="text-sm text-muted-foreground">
              إجمالي: <span className="font-semibold">{totalSales.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم العميل..."
            className="w-full pr-10 bg-card text-right"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <EmptyState
            title="لا توجد فواتير"
            description="ابدأ بإنشاء فاتورة مبيعات جديدة"
          />
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-card p-4 rounded-lg border border-border shadow-sm animate-scale-in"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg font-bold text-primary">
                    {invoice.total.toFixed(2)}
                  </span>
                  <div className="text-right">
                    <p className="font-medium">{invoice.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice.items.length} منتج
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SalesInvoiceForm open={showForm} onClose={() => setShowForm(false)} />
    </PageLayout>
  );
};

export default Sales;
