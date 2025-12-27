import { Users, Plus, Search } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Customers = () => {
  return (
    <PageLayout>
      <div className="p-4 space-y-6">
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-4 py-2 rounded-lg shadow-md">
              <Plus className="h-4 w-4" />
              <span>عميل جديد</span>
            </Button>

            <h2 className="text-2xl font-bold text-foreground">العملاء</h2>
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="ابحث عن عميل..."
              className="w-full pr-10 bg-card border-border text-right placeholder:text-right"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">لا يوجد عملاء</h3>
          <p className="text-sm text-muted-foreground">ابدأ بإضافة عملاء جدد</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Customers;
