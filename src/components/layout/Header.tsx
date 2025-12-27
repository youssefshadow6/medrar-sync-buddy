import { Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="bg-header text-header-foreground px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>متصل</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>غير متصل</span>
          </>
        )}
      </div>
      <h1 className="text-xl font-bold tracking-wide">MEDRAR</h1>
    </header>
  );
};

export default Header;
