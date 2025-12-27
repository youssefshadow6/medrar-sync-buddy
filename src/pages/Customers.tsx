import { useState } from "react";
import { Users, Plus, Search, Eye, CreditCard, Trash2, Edit2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/database";
import { Customer } from "@/lib/types";
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

const Customers = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const salesInvoices = useLiveQuery(() => db.salesInvoices.toArray()) || [];
  const customerPayments = useLiveQuery(() => db.customerPayments.toArray()) || [];

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleAddCustomer = async () => {
    if (!newName.trim()) {
      toast({ title: "الرجاء إدخال اسم العميل", variant: "destructive" });
      return;
    }

    await db.customers.add({
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    toast({ title: "تم إضافة العميل بنجاح" });
    setNewName("");
    setNewPhone("");
    setShowAddForm(false);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (confirm(`هل أنت متأكد من حذف العميل "${customer.name}"؟`)) {
      await db.customers.delete(customer.id!);
      toast({ title: "تم حذف العميل" });
    }
  };

  const handlePayment = async () => {
    if (!selectedCustomer || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "الرجاء إدخال مبلغ صحيح", variant: "destructive" });
      return;
    }

    await db.customerPayments.add({
      customerId: selectedCustomer.id!,
      customerName: selectedCustomer.name,
      amount,
      note: paymentNote || undefined,
      createdAt: new Date(),
    });

    await db.customers.update(selectedCustomer.id!, {
      balance: selectedCustomer.balance - amount,
      updatedAt: new Date(),
    });

    toast({ title: "تم تسجيل الدفعة بنجاح" });
    setPaymentAmount("");
    setPaymentNote("");
    setShowPaymentForm(false);
    setSelectedCustomer(null);
  };

  const getCustomerInvoices = (customerId: number) => {
    return salesInvoices.filter((inv) => inv.customerId === customerId);
  };

  const getCustomerPayments = (customerId: number) => {
    return customerPayments.filter((p) => p.customerId === customerId);
  };

  return (
    <PageLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button onClick={() => setShowAddForm(true)} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            <span>عميل جديد</span>
          </Button>

          <h2 className="text-2xl font-bold text-foreground">العملاء</h2>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن عميل..."
            className="w-full pr-10 bg-card text-right"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">لا يوجد عملاء</h3>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة عملاء جدد</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-card p-4 rounded-lg border border-border shadow-sm animate-scale-in"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`text-lg font-bold ${customer.balance > 0 ? 'text-destructive' : customer.balance < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    {customer.balance.toFixed(2)}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{customer.name}</p>
                    {customer.phone && (
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(customer);
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
                      setSelectedCustomer(customer);
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

      {/* Add Customer Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">إضافة عميل جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-right block">اسم العميل</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="أدخل اسم العميل"
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
            <Button onClick={handleAddCustomer} className="flex-1">
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
              تسجيل دفعة من {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-right">
              الرصيد الحالي: <span className="font-bold">{selectedCustomer?.balance.toFixed(2)}</span>
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
              تفاصيل العميل: {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                <p className={`text-2xl font-bold ${selectedCustomer.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                  {selectedCustomer.balance.toFixed(2)}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-right">الفواتير</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getCustomerInvoices(selectedCustomer.id!).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-right">لا توجد فواتير</p>
                  ) : (
                    getCustomerInvoices(selectedCustomer.id!).map((inv) => (
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
                  {getCustomerPayments(selectedCustomer.id!).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-right">لا توجد مدفوعات</p>
                  ) : (
                    getCustomerPayments(selectedCustomer.id!).map((payment) => (
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

export default Customers;
