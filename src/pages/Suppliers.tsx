import { useState } from "react";
import { Truck, Plus, Search, Eye, CreditCard, Trash2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/database";
import { Supplier } from "@/lib/types";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Suppliers = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];
  const purchaseInvoices = useLiveQuery(() => db.purchaseInvoices.toArray()) || [];
  const supplierPayments = useLiveQuery(() => db.supplierPayments.toArray()) || [];

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleAddSupplier = async () => {
    if (!newName.trim()) {
      toast({ title: "الرجاء إدخال اسم المورد", variant: "destructive" });
      return;
    }

    await db.suppliers.add({
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    toast({ title: "تم إضافة المورد بنجاح" });
    setNewName("");
    setNewPhone("");
    setShowAddForm(false);
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (confirm(`هل أنت متأكد من حذف المورد "${supplier.name}"؟`)) {
      await db.suppliers.delete(supplier.id!);
      toast({ title: "تم حذف المورد" });
    }
  };

  const handlePayment = async () => {
    if (!selectedSupplier || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "الرجاء إدخال مبلغ صحيح", variant: "destructive" });
      return;
    }

    await db.supplierPayments.add({
      supplierId: selectedSupplier.id!,
      supplierName: selectedSupplier.name,
      amount,
      note: paymentNote || undefined,
      createdAt: new Date(),
    });

    await db.suppliers.update(selectedSupplier.id!, {
      balance: selectedSupplier.balance - amount,
      updatedAt: new Date(),
    });

    toast({ title: "تم تسجيل الدفعة بنجاح" });
    setPaymentAmount("");
    setPaymentNote("");
    setShowPaymentForm(false);
    setSelectedSupplier(null);
  };

  const getSupplierInvoices = (supplierId: number) => {
    return purchaseInvoices.filter((inv) => inv.supplierId === supplierId);
  };

  const getSupplierPayments = (supplierId: number) => {
    return supplierPayments.filter((p) => p.supplierId === supplierId);
  };

  return (
    <PageLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button onClick={() => setShowAddForm(true)} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            <span>مورد جديد</span>
          </Button>

          <h2 className="text-2xl font-bold text-foreground">الموردين</h2>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن مورد..."
            className="w-full pr-10 bg-card text-right"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Suppliers List */}
        {filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Truck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">لا يوجد موردين</h3>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة موردين جدد</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-card p-4 rounded-lg border border-border shadow-sm animate-scale-in"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`text-lg font-bold ${supplier.balance > 0 ? 'text-destructive' : supplier.balance < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    {supplier.balance.toFixed(2)}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{supplier.name}</p>
                    {supplier.phone && (
                      <p className="text-xs text-muted-foreground">{supplier.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowPaymentForm(true);
                    }}
                  >
                    <CreditCard className="h-4 w-4 ml-1" />
                    دفعة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">إضافة مورد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-right block">اسم المورد</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="أدخل اسم المورد"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block">رقم الهاتف (اختياري)</Label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="أدخل رقم الهاتف"
                className="text-right"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleAddSupplier} className="flex-1">
              إضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">
              تسجيل دفعة للمورد {selectedSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-right">
              الرصيد الحالي: <span className="font-bold">{selectedSupplier?.balance.toFixed(2)}</span>
            </p>
            <div className="space-y-2">
              <Label className="text-right block">مبلغ الدفعة</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block">ملاحظة (اختياري)</Label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="أدخل ملاحظة"
                className="text-right"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPaymentForm(false)} className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handlePayment} className="flex-1">
              تسجيل الدفعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-right">
              تفاصيل المورد: {selectedSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">الرصيد الحالي (مستحق لنا)</p>
                <p className={`text-2xl font-bold ${selectedSupplier.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                  {selectedSupplier.balance.toFixed(2)}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-right">فواتير الشراء</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getSupplierInvoices(selectedSupplier.id!).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-right">لا توجد فواتير</p>
                  ) : (
                    getSupplierInvoices(selectedSupplier.id!).map((inv) => (
                      <div key={inv.id} className="bg-card p-3 rounded border border-border flex justify-between">
                        <span className="text-primary font-medium">{inv.total.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(inv.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-right">المدفوعات</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getSupplierPayments(selectedSupplier.id!).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-right">لا توجد مدفوعات</p>
                  ) : (
                    getSupplierPayments(selectedSupplier.id!).map((payment) => (
                      <div key={payment.id} className="bg-card p-3 rounded border border-border flex justify-between">
                        <span className="text-success font-medium">{payment.amount.toFixed(2)}</span>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                          {payment.note && (
                            <p className="text-xs text-muted-foreground">{payment.note}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Suppliers;
