import { useState } from "react";
import { ShoppingBag, Plus, Search } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/database";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PurchaseInvoiceForm from "@/components/purchases/PurchaseInvoiceForm";

const Purchases = () => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const invoices = useLiveQuery(() => 
    db.purchaseInvoices.orderBy('createdAt').reverse().toArray()
  ) || [];

  const totalPurchases = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const filteredInvoices = invoices.filter((inv) =>
    inv.supplierName.toLowerCase().includes(search.toLowerCase().trim())
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
            <span>فاتورة شراء جديدة</span>
          </Button>

          <div className="text-right">
            <h2 className="text-2xl font-bold text-foreground">المشتريات</h2>
            <p className="text-sm text-muted-foreground">
              إجمالي: <span className="font-semibold">{totalPurchases.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المورد..."
            className="w-full pr-10 bg-card text-right"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">لا توجد فواتير شراء</h3>
            <p className="text-sm text-muted-foreground">ابدأ بإنشاء فاتورة شراء جديدة</p>
          </div>
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
                    <p className="font-medium">{invoice.supplierName}</p>
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

      <PurchaseInvoiceForm open={showForm} onClose={() => setShowForm(false)} />
    </PageLayout>
  );
};

export default Purchases;
