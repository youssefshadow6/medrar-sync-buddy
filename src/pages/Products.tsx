import { useState } from "react";
import { Package, Plus, Search, Trash2, Edit2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/database";
import { Product } from "@/lib/types";
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

const Products = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const products = useLiveQuery(() => db.products.toArray()) || [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleAddProduct = async () => {
    if (!newName.trim()) {
      toast({ title: "الرجاء إدخال اسم المنتج", variant: "destructive" });
      return;
    }

    const price = newPrice ? parseFloat(newPrice) : null;

    await db.products.add({
      name: newName.trim(),
      price,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    toast({ title: "تم إضافة المنتج بنجاح" });
    setNewName("");
    setNewPrice("");
    setShowAddForm(false);
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !editName.trim()) {
      toast({ title: "الرجاء إدخال اسم المنتج", variant: "destructive" });
      return;
    }

    const price = editPrice ? parseFloat(editPrice) : null;

    await db.products.update(selectedProduct.id!, {
      name: editName.trim(),
      price,
      updatedAt: new Date(),
    });

    toast({ title: "تم تحديث المنتج بنجاح" });
    setSelectedProduct(null);
    setEditName("");
    setEditPrice("");
    setShowEditForm(false);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
      await db.products.delete(product.id!);
      toast({ title: "تم حذف المنتج" });
    }
  };

  const openEditForm = (product: Product) => {
    setSelectedProduct(product);
    setEditName(product.name);
    setEditPrice(product.price !== null ? product.price.toString() : "");
    setShowEditForm(true);
  };

  return (
    <PageLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button onClick={() => setShowAddForm(true)} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            <span>منتج جديد</span>
          </Button>

          <div className="text-right">
            <h2 className="text-2xl font-bold text-foreground">المنتجات</h2>
            <p className="text-sm text-muted-foreground">{products.length} منتج</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full pr-10 bg-card text-right"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">لا توجد منتجات</h3>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة منتجات جديدة</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card p-4 rounded-lg border border-border shadow-sm animate-scale-in"
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(product)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-primary font-semibold">
                      {product.price !== null ? `${product.price.toFixed(2)}` : 'بدون سعر'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-right block">اسم المنتج</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="أدخل اسم المنتج"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block">السعر (اختياري)</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="أدخل السعر"
                className="text-right"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleAddProduct} className="flex-1">
              إضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">تعديل المنتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-right block">اسم المنتج</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="أدخل اسم المنتج"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block">السعر</Label>
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="أدخل السعر"
                className="text-right"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditForm(false)} className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleEditProduct} className="flex-1">
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Products;
