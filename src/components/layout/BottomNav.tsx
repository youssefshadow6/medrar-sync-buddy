import { Package, Truck, Users, ShoppingBag, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Package, label: "المنتجات", path: "/products" },
  { icon: Truck, label: "الموردين", path: "/suppliers" },
  { icon: Users, label: "العملاء", path: "/customers" },
  { icon: ShoppingBag, label: "المشتريات", path: "/purchases" },
  { icon: ShoppingCart, label: "المبيعات", path: "/" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-nav border-t border-border shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-nav-active"
                  : "text-nav-inactive hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-nav-active rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
