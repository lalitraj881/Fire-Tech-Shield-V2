import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, LogOut, User, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInspection } from "@/context/InspectionContext";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export function Header({ showBack, title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { technician, logoutUser, resetData } = useInspection();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const handleChangeSite = () => {
    // Clear current selection data but keep user logged in
    resetData();
    
    // Clear all localStorage to prevent data conflicts with new site
    // This will remove: fts_jobs, fts_selectedCustomerId, fts_selectedSiteId, etc.
    // Note: resetData() already clears some items, but this ensures everything is cleared
    localStorage.clear();
    
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
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
            <div className="flex-1 min-w-0">
               <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
            </div>
          )}
        </div>

        {/* Right Section */}
        {!isLoginPage && (
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {technician && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{technician.name || technician.email}</span>
                <span className="text-xs text-muted-foreground">(Technician)</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={handleChangeSite}
              title="Change Site"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Change Site</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  <span className="hidden sm:inline">Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
