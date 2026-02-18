import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Eye, EyeOff, Building2, MapPin, AlertTriangle } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
// const { loginUser, loading, error } = useInspection();
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Site } from "@/types";

export default function Login() {
  const navigate = useNavigate();
  const { 
    resetData, 
    getAssignedCustomers, 
    getAssignedSites, 
    setSelectedCustomerId, 
    setSelectedSiteId,
    selectedCustomerId, // From context
    selectedSiteId, // From context
    technician,
    loginUser, loading, error, assignedCustomers, assignedSites, getAssignedJobs
  } = useInspection();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});
  const [loadingSites, setLoadingSites] = useState(false);
  // Initialize local state from context if available, else empty
  const [selectedCustomer, setSelectedCustomer] = useState<string>(selectedCustomerId || "");
  const [selectedSite, setSelectedSite] = useState<string>(selectedSiteId || "");
  const [step, setStep] = useState<"login" | "selection">("login");
  const [sitesForCustomer, setSitesForCustomer] = useState<Site[]>([]); 

  // Check for existing session on mount (secure remember me)
  useEffect(() => {
    const checkExistingSession = async () => {
      const savedEmail = localStorage.getItem('fts_remember_email');
      
      if (savedEmail && rememberMe) {
        // Check if session is still valid
        try {
          const { checkSession } = await import('@/services/authService');
          const loggedUser = await checkSession();
          
          if (loggedUser && loggedUser !== 'Guest') {
            // Session is valid, auto-fill email only
            setEmail(savedEmail);
            setRememberMe(true);
          } else {
            // Session expired, clear saved email
            localStorage.removeItem('fts_remember_email');
          }
        } catch (error) {
          console.error('Session check failed:', error);
        }
      }
    };
    
    checkExistingSession();
  }, []); 

  // Redirect logic
  useEffect(() => {
    if (technician) {
      // If user is logged in, show selection screen (don't auto-redirect)
      // This allows them to change customer/site selection
      setStep("selection");
    }
  }, [technician]);

  // const assignedCustomers = getAssignedCustomers();
  // const assignedSites =  [];

  // const handleLogin = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   resetData();
  //   setStep("selection");
  // };
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await loginUser(email, password);
      
      // Handle Remember Me - only save email, session is in httpOnly cookie
      if (rememberMe) {
        localStorage.setItem('fts_remember_email', email);
      } else {
        localStorage.removeItem('fts_remember_email');
      }
      
      resetData();
      setStep("selection");
    } catch {
      // error already handled in context
    }
  };
  const handleContinue = () => {
    if (selectedCustomer) {
      setSelectedCustomerId(selectedCustomer);
    }
    if (selectedSite) {
      setSelectedSiteId(selectedSite);
    }
    
    // Navigate immediately - don't make user wait
    // Jobs will load in background on Dashboard
    navigate("/dashboard");
    
    // Load jobs in background after navigation
    getAssignedJobs(selectedCustomer, selectedSite).catch(error => {
      console.error('Failed to load jobs:', error);
    });
  };

  // Load sites when component mounts with a pre-selected customer
  useEffect(() => {
    const loadInitialSites = async () => {
      if (step === "selection" && selectedCustomer && sitesForCustomer.length === 0) {
        setLoadingSites(true);
        try {
          const sites = await getAssignedSites(selectedCustomer);
          setSitesForCustomer(sites);
        } catch (error) {
          console.error('Failed to load initial sites:', error);
        } finally {
          setLoadingSites(false);
        }
      }
    };
    
    loadInitialSites();
  }, [step, selectedCustomer]); // Run when step changes to selection or customer is set

  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomer(customerId);
    setSelectedSite(""); // Reset site when customer changes
    setSitesForCustomer([]); // Clear previous sites
    
    if (customerId) {
      setLoadingSites(true);
      try {
        const sites = await getAssignedSites(customerId); // fetch async sites
        setSitesForCustomer(sites);
      } catch (error) {
        console.error('Failed to fetch sites:', error);
      } finally {
        setLoadingSites(false);
      }
    }
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
        {error && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({...prev, email: undefined}));
                    }
                  }}
                  className={`h-11 ${validationErrors.email ? 'border-destructive' : ''}`}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors(prev => ({...prev, password: undefined}));
                      }
                    }}
                    className={`h-11 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
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
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
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
                {/* <Button variant="link" className="px-0 text-sm text-primary">
                  Forgot password?
                </Button> */}
              </div>

              <Button type="submit"  disabled={loading} className="w-full h-11 text-base font-semibold">
                 {loading ? "Signing In..." : "Sign In"}

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
                <p className="font-semibold text-foreground">{technician?.name || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground">{technician?.email || ''}</p>
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
                    {assignedCustomers.map((customer, index) => (
                      <SelectItem key={`${customer.id}-${index}`} value={customer.name}>
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
                  disabled={!selectedCustomer || loadingSites}                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={
                      loadingSites 
                        ? "Loading sites..." 
                        : !selectedCustomer 
                          ? "Select customer first" 
                          : sitesForCustomer.length === 0
                            ? "No sites available"
                            : "Choose a site..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {sitesForCustomer.map((site, index) => (
                      <SelectItem key={`${site.name}-${index}`} value={site.name}>
                        <div className="flex flex-col items-start text-left">
                          <span>{site.site_code}</span>
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
