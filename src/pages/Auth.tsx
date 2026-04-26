import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Tractor, ShoppingBag, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useLanguage } from "@/i18n/LanguageProvider";

type UserRole = "farmer" | "customer";
type AuthMode = "login" | "register";

// Validation schemas
const emailSchema = z.string().trim().email("Düzgün e-poçt ünvanı daxil edin").max(255, "E-poçt çox uzundur");
const passwordSchema = z.string().min(6, "Şifrə ən azı 6 simvol olmalıdır").max(100, "Şifrə çox uzundur");
const nameSchema = z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(100, "Ad çox uzundur");
const phoneSchema = z.string().trim().max(20, "Telefon nömrəsi çox uzundur").optional();

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const isAz = language === "az";
  
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Farmer specific
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmSize, setFarmSize] = useState("");
  
  // Customer specific
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (user && !loading) {
      const role = user.user_metadata?.role;
      navigate(role === "farmer" ? "/dashboard" : "/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const roleParam = searchParams.get("role");

    if (modeParam === "login" || modeParam === "register") {
      setAuthMode(modeParam);
    }

    if (modeParam === "register") {
      if (roleParam === "farmer" || roleParam === "customer") {
        setSelectedRole(roleParam);
      } else {
        setSelectedRole(null);
      }
    } else if (modeParam === "login") {
      setSelectedRole(null);
    }
  }, [searchParams]);

  const validateForm = (): string | null => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (authMode === "register") {
        nameSchema.parse(fullName);
        if (phone) phoneSchema.parse(phone);
        
        if (selectedRole === "farmer") {
          if (!farmName.trim()) return "Farm name is required";
          if (!farmLocation.trim()) return "Farm location is required";
        }
      }
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return "Validation error";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: isAz ? "Yoxlama xətası" : "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: isAz ? "Giriş alınmadı" : "Login Failed",
            description: error.message === "Invalid login credentials" 
              ? isAz ? "E-poçt və ya şifrə yanlışdır. Yenidən cəhd edin." : "Invalid email or password. Please try again."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: isAz ? "Xoş gəlmisiniz" : "Welcome back!",
            description: isAz ? "Uğurla daxil oldunuz." : "You have successfully signed in.",
          });
          const { data } = await supabase.auth.getUser();
          const role = data.user?.user_metadata?.role;
          navigate(role === "farmer" ? "/dashboard" : "/");
        }
      } else {
        if (!selectedRole) {
          toast({
            title: isAz ? "Hesab növünü seçin" : "Select Account Type",
            description: isAz ? "Fermer və ya müştəri olduğunuzu seçin." : "Please select whether you're a farmer or customer.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(email, password, {
          full_name: fullName,
          phone: phone || undefined,
          role: selectedRole,
          farm_name: selectedRole === "farmer" ? farmName : undefined,
          farm_location: selectedRole === "farmer" ? farmLocation : undefined,
          farm_size: selectedRole === "farmer" ? farmSize : undefined,
          delivery_address: selectedRole === "customer" ? deliveryAddress : undefined,
          city: selectedRole === "customer" ? city : undefined,
        });

        if (error) {
          const errorMessage = error.message.includes("already registered")
            ? isAz ? "Bu e-poçt artıq qeydiyyatdan keçib. Zəhmət olmasa daxil olun." : "This email is already registered. Please sign in instead."
            : error.message;
          toast({
            title: isAz ? "Qeydiyyat alınmadı" : "Registration Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: isAz ? "Hesab yaradıldı" : "Account Created!",
            description: isAz ? "FarmMarket Azerbaijan-a xoş gəlmisiniz!" : "Welcome to FarmMarket Azerbaijan!",
          });
          const { data } = await supabase.auth.getUser();
          const role = data.user?.user_metadata?.role;
          navigate(role === "farmer" ? "/dashboard" : "/");
        }
      }
    } catch (error) {
      toast({
        title: isAz ? "Xəta" : "Error",
        description: isAz ? "Gözlənilməz xəta baş verdi. Yenidən cəhd edin." : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setFarmName("");
    setFarmLocation("");
    setFarmSize("");
    setDeliveryAddress("");
    setCity("");
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">{isAz ? "Yüklənir..." : "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4 gap-2">
          <Button size="sm" variant={isAz ? "default" : "outline"} onClick={() => setLanguage("az")}>AZ</Button>
          <Button size="sm" variant={!isAz ? "default" : "outline"} onClick={() => setLanguage("en")}>EN</Button>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-soft group-hover:shadow-glow-primary transition-all duration-300">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xl text-foreground leading-tight">FarmMarket</span>
              <span className="text-xs text-muted-foreground leading-tight">Azerbaijan</span>
            </div>
          </a>
          <h1 className="text-2xl font-bold text-foreground">
            {authMode === "login" ? (isAz ? "Yenidən xoş gəlmisiniz" : "Welcome Back") : (isAz ? "Hesab yaradın" : "Create Account")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {authMode === "login" 
              ? (isAz ? "Hesabınıza daxil olun" : "Sign in to access your account")
              : (isAz ? "Təzə məhsul marketplace-ə qoşulun" : "Join the fresh produce marketplace")}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
          {/* Role Selection for Registration */}
          {authMode === "register" && !selectedRole && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center text-foreground mb-6">
                {isAz ? "Mən qoşulmaq istəyirəm..." : "I want to join as a..."}
              </h2>
              
              <button
                onClick={() => setSelectedRole("farmer")}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary bg-background hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Tractor className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground text-lg">{isAz ? "Fermer" : "Farmer"}</h3>
                    <p className="text-sm text-muted-foreground">{isAz ? "Təzə məhsullarınızı müştərilərə birbaşa satın" : "Sell your fresh produce directly to customers"}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole("customer")}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary bg-background hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <ShoppingBag className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground text-lg">{isAz ? "Müştəri" : "Customer"}</h3>
                    <p className="text-sm text-muted-foreground">{isAz ? "Təzə məhsulları yerli fermerlərdən birbaşa alın" : "Buy fresh products directly from local farmers"}</p>
                  </div>
                </div>
              </button>

              <div className="pt-4 text-center">
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isAz ? <>Artıq hesabınız var? <span className="font-semibold">Daxil olun</span></> : <>Already have an account? <span className="font-semibold">Sign in</span></>}
                </button>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {authMode === "register" && selectedRole && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {isAz ? "Rol seçiminə qayıt" : "Back to role selection"}
              </button>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 mb-4">
                {selectedRole === "farmer" ? (
                  <Tractor className="w-5 h-5 text-primary" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-accent" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {isAz
                    ? `Qeydiyyat növü: ${selectedRole === "farmer" ? "Fermer" : "Müştəri"}`
                    : `Registering as ${selectedRole === "farmer" ? "Farmer" : "Customer"}`}
                </span>
              </div>

              {/* Common Fields */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{isAz ? "Ad və soyad *" : "Full Name *"}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAz ? "Ad və soyadınızı daxil edin" : "Enter your full name"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAz ? "E-poçtunuzu daxil edin" : "Enter your email"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{isAz ? "Telefon nömrəsi" : "Phone Number"}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994 XX XXX XX XX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{isAz ? "Şifrə *" : "Password *"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isAz ? "Şifrə yaradın (ən azı 6 simvol)" : "Create a password (min 6 characters)"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Farmer Specific Fields */}
              {selectedRole === "farmer" && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">{isAz ? "Fermer məlumatları" : "Farm Information"}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmName">{isAz ? "Təsərrüfat adı *" : "Farm Name *"}</Label>
                    <Input
                      id="farmName"
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder={isAz ? "Təsərrüfat adını daxil edin" : "Enter your farm name"}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmLocation">{isAz ? "Təsərrüfat yeri *" : "Farm Location *"}</Label>
                    <Input
                      id="farmLocation"
                      type="text"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="e.g., Ganja, Sheki, Lankaran"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmSize">{isAz ? "Təsərrüfat ölçüsü (hektar)" : "Farm Size (hectares)"}</Label>
                    <Input
                      id="farmSize"
                      type="text"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      placeholder={isAz ? "məs., 5 hektar" : "e.g., 5 hectares"}
                    />
                  </div>
                </>
              )}

              {/* Customer Specific Fields */}
              {selectedRole === "customer" && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">{isAz ? "Çatdırılma məlumatı (istəyə bağlı)" : "Delivery Information (Optional)"}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">{isAz ? "Şəhər" : "City"}</Label>
                    <Input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Baku, Sumqayit, Ganja"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">{isAz ? "Çatdırılma ünvanı" : "Delivery Address"}</Label>
                    <Input
                      id="deliveryAddress"
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={isAz ? "Ünvanı daxil edin" : "Enter your delivery address"}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? (isAz ? "Hesab yaradılır..." : "Creating Account...") : (isAz ? "Hesab yarat" : "Create Account")}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    resetForm();
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isAz ? <>Artıq hesabınız var? <span className="font-semibold">Daxil olun</span></> : <>Already have an account? <span className="font-semibold">Sign in</span></>}
                </button>
              </div>
            </form>
          )}

          {/* Login Form */}
          {authMode === "login" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Email</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">{isAz ? "Şifrə" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isAz ? "Şifrənizi daxil edin" : "Enter your password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? (isAz ? "Daxil olunur..." : "Signing in...") : (isAz ? "Daxil ol" : "Sign In")}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    resetForm();
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isAz ? <>Hesabınız yoxdur? <span className="font-semibold">Yaradın</span></> : <>Don't have an account? <span className="font-semibold">Create one</span></>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAz ? "Ana səhifəyə qayıt" : "Back to Home"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
