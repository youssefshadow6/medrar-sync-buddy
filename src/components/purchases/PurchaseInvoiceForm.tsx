import { useState } from "react";
import { Plus, X, Trash2, Search } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, searchMatch } from "@/lib/database";
import { Supplier, Product, InvoiceItem } from "@/lib/types";
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

interface PurchaseInvoiceFormProps {
  open: boolean;
  onClose: () => void;
}

const PurchaseInvoiceForm = ({ open, onClose }: PurchaseInvoiceFormProps) => {
  const { toast } = useToast();
  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];
  const products = useLiveQuery(() => db.products.toArray()) || [];

  const filteredSuppliers = suppliers.filter((s) =>
    searchMatch(s.name, supplierSearch)
  );

  const filteredProducts = products.filter((p) =>
    searchMatch(p.name, productSearch)
  );

  const invoiceTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierSearch(supplier.name);
    setShowSupplierDropdown(false);
  };

  const handleAddNewSupplier = async () => {
    if (!supplierSearch.trim()) return;
    
    const id = await db.suppliers.add({
      name: supplierSearch.trim(),
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const newSupplier = await db.suppliers.get(id);
    if (newSupplier) {
      setSelectedSupplier(newSupplier);
    }
    setShowSupplierDropdown(false);
    
    toast({ title: "تم إضافة المورد بنجاح" });
  };

  const handleAddProduct = (product: Product) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].price;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: product.id!,
          productName: product.name,
          quantity: 1,
          price: product.price ?? 0,
          total: product.price ?? 0,
        },
      ]);
    }
    
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleAddNewProduct = async () => {
    if (!productSearch.trim()) return;
    
    const id = await db.products.add({
      name: productSearch.trim(),
      price: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    setItems([
      ...items,
      {
        productId: id,
        productName: productSearch.trim(),
        quantity: 1,
        price: 0,
        total: 0,
      },
    ]);
    
    setProductSearch("");
    setShowProductDropdown(false);
    
    toast({ title: "تم إضافة المنتج" });
  };

  const handleUpdateItem = (index: number, field: "quantity" | "price", value: number) => {
    const updated = [...items];
    updated[index][field] = value;
    updated[index].total = updated[index].quantity * updated[index].price;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedSupplier) {
      toast({ title: "الرجاء اختيار مورد", variant: "destructive" });
      return;
    }
    
    if (items.length === 0) {
      toast({ title: "الرجاء إضافة منتجات", variant: "destructive" });
      return;
    }

    // Save invoice
    await db.purchaseInvoices.add({
      supplierId: selectedSupplier.id!,
      supplierName: selectedSupplier.name,
      items,
      total: invoiceTotal,
      createdAt: new Date(),
    });

    // Update supplier balance
    await db.suppliers.update(selectedSupplier.id!, {
      balance: selectedSupplier.balance + invoiceTotal,
      updatedAt: new Date(),
    });

    // Update product prices
    for (const item of items) {
      const product = await db.products.get(item.productId);
      if (product && product.price !== item.price) {
        await db.products.update(item.productId, {
          price: item.price,
          updatedAt: new Date(),
        });
      }
    }

    toast({ title: "تم حفظ فاتورة الشراء بنجاح" });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedSupplier(null);
    setSupplierSearch("");
    setProductSearch("");
    setItems([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">فاتورة شراء جديدة</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label className="text-right block">المورد</Label>
            <div className="relative">
              <Input
                value={supplierSearch}
                onChange={(e) => {
                  setSupplierSearch(e.target.value);
                  setShowSupplierDropdown(true);
                  setSelectedSupplier(null);
                }}
                onFocus={() => setShowSupplierDropdown(true)}
                placeholder="ابحث عن مورد..."
                className="text-right pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              
              {showSupplierDropdown && supplierSearch && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <button
                        key={supplier.id}
                        className="w-full px-4 py-2 text-right hover:bg-muted transition-colors"
                        onClick={() => handleSelectSupplier(supplier)}
                      >
                        {supplier.name}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 space-y-2">
                      <p className="text-sm text-muted-foreground text-right">لا يوجد مورد بهذا الاسم</p>
                      <Button
                        size="sm"
                        onClick={handleAddNewSupplier}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        إضافة "{supplierSearch}"
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedSupplier && (
              <p className="text-sm text-primary">المورد المحدد: {selectedSupplier.name}</p>
            )}
          </div>

          {/* Product Search */}
          <div className="space-y-2">
            <Label className="text-right block">إضافة منتج</Label>
            <div className="relative">
              <Input
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                onFocus={() => setShowProductDropdown(true)}
                placeholder="ابحث عن منتج..."
                className="text-right pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              
              {showProductDropdown && productSearch && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        className="w-full px-4 py-2 text-right hover:bg-muted transition-colors flex justify-between items-center"
                        onClick={() => handleAddProduct(product)}
                      >
                        <span className="text-sm text-muted-foreground">
                          {product.price !== null ? `${product.price.toFixed(2)}` : 'بدون سعر'}
                        </span>
                        <span>{product.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 space-y-2">
                      <p className="text-sm text-muted-foreground text-right">لا يوجد منتج بهذا الاسم</p>
                      <Button
                        size="sm"
                        onClick={handleAddNewProduct}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        إضافة "{productSearch}"
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 grid grid-cols-12 gap-2 text-sm font-medium">
                <div className="col-span-1"></div>
                <div className="col-span-2 text-center">الإجمالي</div>
                <div className="col-span-3 text-center">السعر</div>
                <div className="col-span-2 text-center">الكمية</div>
                <div className="col-span-4 text-right">المنتج</div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 grid grid-cols-12 gap-2 items-center border-t border-border"
                  >
                    <div className="col-span-1">
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="col-span-2 text-center font-medium">
                      {item.total.toFixed(2)}
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateItem(index, "price", parseFloat(e.target.value) || 0)}
                        className="text-center h-8"
                        placeholder="السعر"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value) || 1)}
                        className="text-center h-8"
                        min={1}
                      />
                    </div>
                    <div className="col-span-4 text-right truncate">{item.productName}</div>
                  </div>
                ))}
              </div>
              
              <div className="bg-primary/10 px-4 py-3 flex justify-between items-center border-t border-border">
                <span className="text-lg font-bold text-primary">{invoiceTotal.toFixed(2)}</span>
                <span className="font-medium">إجمالي الفاتورة:</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            إلغاء
          </Button>
          <Button onClick={handleSave} className="flex-1">
            حفظ الفاتورة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseInvoiceForm;
