import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, User, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isFarmer = profile?.role === "farmer";
  const landingHref = (hash?: string) => {
    const target = hash ? `/#${hash}` : "/";
    if (location.pathname === "/" && hash) {
      return `#${hash}`;
    }
    return target;
  };

  const { data: pendingCount } = useQuery({
    queryKey: ["pending-requests-count", profile?.role, user?.id],
    queryFn: async () => {
      if (!user || profile?.role !== "farmer") return 0;
      const { data, error } = await supabase
        .from("order_requests")
        .select("id")
        .eq("status", "pending")
        .eq("farmer_hidden", false)
        .in("farmer_id", (
          await supabase
            .from("farmer_profiles")
            .select("id")
            .eq("user_id", user.id)
        ).data?.map((row) => row.id) || []);
      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!user && profile?.role === "farmer",
  });

  const navLinks = isFarmer
    ? [
        { name: "Dashboard", href: "/dashboard", isRoute: true },
        { name: "Marketplace", href: "/farmers", isRoute: true },
        { name: "Products", href: "/products", isRoute: true },
      ]
    : [
        { name: "Home", href: landingHref(), isRoute: true },
        { name: "Products", href: landingHref("products"), isRoute: false },
        { name: "Explore Producers", href: landingHref("producers"), isRoute: false },
        { name: "How It Works", href: landingHref("how-it-works"), isRoute: false },
        { name: "About", href: landingHref("about"), isRoute: false },
      ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to={isFarmer ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft group-hover:shadow-glow-primary transition-all duration-300">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-tight">FarmMarket</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Azerbaijan</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 relative"
                >
                  {link.name}
                  {"badge" in link && link.badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {link.name}
                </a>
              )
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/requests">
              <Button variant="ghost" className="text-muted-foreground gap-2">
                <ShoppingCart className="w-5 h-5" />
                Requests
                {pendingCount ? (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                    {pendingCount}
                  </span>
                ) : null}
              </Button>
            </Link>
            
            {user ? (
              <Button variant="outline" className="gap-2" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/auth?mode=login">
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                {profile?.role !== "customer" && (
                  <Link to="/auth?mode=register&role=farmer">
                    <Button>Start Selling</Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center justify-between">
                      {link.name}
                      {"badge" in link && link.badge > 0 && (
                        <span className="ml-3 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                          {link.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )
              )}
              <div className="flex flex-col gap-2 mt-4 px-4">
                {user ? (
                  <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link to="/auth?mode=login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        Sign In
                      </Button>
                    </Link>
                    {profile?.role !== "customer" && (
                      <Link to="/auth?mode=register&role=farmer" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full">Start Selling</Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
