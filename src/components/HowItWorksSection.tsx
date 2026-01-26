import { Link } from "react-router-dom";
import { Search, ShoppingBag, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const buyerSteps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description: "Explore fresh produce from verified local farmers. Filter by category, location, or freshness.",
  },
  {
    icon: ShoppingBag,
    title: "Add to Cart",
    description: "Select your products, choose quantities, and add them to your cart with ease.",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Pay securely online or choose cash on delivery. Your choice, your convenience.",
  },
  {
    icon: Truck,
    title: "Track & Receive",
    description: "Track your order in real-time and receive farm-fresh products at your doorstep.",
  },
];

const HowItWorksSection = () => {
  const { user } = useAuth();
  const role = user?.user_metadata?.role;
  const browseHref = !user ? "/auth?mode=login" : role === "customer" ? "/products" : "/dashboard";

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            How <span className="text-primary">FarmMarket</span> Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're buying fresh produce or selling your harvest, getting started is easy
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="animate-slide-in-left">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">For Buyers</h3>
                <p className="text-sm text-muted-foreground">Get fresh produce delivered</p>
              </div>
            </div>
            <div className="space-y-6">
              {buyerSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4 group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    {index < buyerSteps.length - 1 && (
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border" />
                    )}
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to={browseHref}>
              <Button className="mt-8" size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
