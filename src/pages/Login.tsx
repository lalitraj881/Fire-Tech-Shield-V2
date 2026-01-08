import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const { resetData } = useInspection();
  const [email, setEmail] = useState("john.smith@fts.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset all demo data on each login
    resetData();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto relative">
            <Shield className="h-16 w-16 text-primary animate-pulse-glow rounded-full" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              FTS <span className="text-primary">Fire Tech Shield</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Technician Portal</p>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="technician@fts.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="px-0 text-sm text-primary">
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold">
              Sign In
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-4">
              Role: <span className="text-foreground font-medium">Technician</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
