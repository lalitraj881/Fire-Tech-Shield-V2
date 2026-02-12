import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Eye, EyeOff, Building2, MapPin } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Login() {
  const navigate = useNavigate();
  const { 
    resetData, 
    getAssignedCustomers, 
    getAssignedSites, 
    setSelectedCustomerId, 
    setSelectedSiteId,
    technician 
  } = useInspection();
  const [email, setEmail] = useState("john.smith@fts.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [step, setStep] = useState<"login" | "selection">("login");

  const assignedCustomers = getAssignedCustomers();
  const assignedSites = selectedCustomer ? getAssignedSites(selectedCustomer) : [];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetData();
    setStep("selection");
  };

  const handleContinue = () => {
    if (selectedCustomer) {
      setSelectedCustomerId(selectedCustomer);
    }
    if (selectedSite) {
      setSelectedSiteId(selectedSite);
    }
    navigate("/home");
  };

  const handleCustomerChange = (value: string) => {
    setSelectedCustomer(value);
    setSelectedSite(""); // Reset site when customer changes
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
            <p className="text-muted-foreground text-sm mt-1">
              {step === "login" ? "Technician Portal" : "Select Customer & Site"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {step === "login" ? (
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
          ) : (
            <div className="space-y-6">
              {/* Technician Info */}
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground">Logged in as</p>
                <p className="font-semibold text-foreground">{technician.name}</p>
                <p className="text-xs text-muted-foreground">{technician.email}</p>
              </div>

              {/* Customer Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Select Customer
                </Label>
                <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Site Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Select Site
                </Label>
                <Select 
                  value={selectedSite} 
                  onValueChange={setSelectedSite}
                  disabled={!selectedCustomer}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={selectedCustomer ? "Choose a site..." : "Select customer first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedSites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <div className="flex flex-col">
                          <span>{site.name}</span>
                          <span className="text-xs text-muted-foreground">{site.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GPS Auto-detect indicator */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  GPS location will auto-detect nearest site
                </span>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-11"
                  onClick={() => setStep("login")}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-11 text-base font-semibold"
                  onClick={handleContinue}
                  disabled={!selectedCustomer}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
