import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SalesHeaderProps {
  total: number;
  onNewInvoice: () => void;
}

const SalesHeader = ({ total, onNewInvoice }: SalesHeaderProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button
          onClick={onNewInvoice}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>فاتورة جديدة</span>
        </Button>

        <div className="text-right">
          <h2 className="text-2xl font-bold text-foreground">المبيعات</h2>
          <p className="text-sm text-muted-foreground">
            إجمالي: <span className="font-semibold">{total.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="ابحث باسم العميل..."
          className="w-full pr-10 bg-card border-border text-right placeholder:text-right"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default SalesHeader;
