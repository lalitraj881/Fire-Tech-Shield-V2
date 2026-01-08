import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, LogOut, User, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export function Header({ showBack, title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/";

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {!showBack && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  FTS <span className="text-primary">Fire Tech Shield</span>
                </h1>
              </div>
            </div>
          )}

          {title && showBack && (
            <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          )}
        </div>

        {/* Right Section */}
        {!isLoginPage && (
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">John Smith</span>
              <span className="text-xs text-muted-foreground">(Technician)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
