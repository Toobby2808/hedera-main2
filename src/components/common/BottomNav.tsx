import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gift, User, MessageCircle } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";

interface NavItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
}

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();

  // Home path is always '/' - the HomeRedirect component handles role-based rendering
  const navItems: NavItem[] = [
    {
      icon: <Home className="w-6 h-6" />,
      activeIcon: <Home className="w-6 h-6" />,
      label: "Home",
      path: "/",
    },
    {
      icon: <Gift className="w-6 h-6" />,
      activeIcon: <Gift className="w-6 h-6" />,
      label: "Rewards",
      path: "/rewards",
    },
    {
      icon: <User className="w-6 h-6" />,
      activeIcon: <User className="w-6 h-6" />,
      label: "Profile",
      path: "/profile",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      activeIcon: <MessageCircle className="w-6 h-6" />,
      label: "Support",
      path: "/support",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      // Consider both '/' and '/driver' as home for active state
      return (
        location.pathname === "/dashboard" || location.pathname === "/driver"
      );
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 py-2 px-4 min-w-[70px] transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    active
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active ? item.activeIcon : item.icon}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
