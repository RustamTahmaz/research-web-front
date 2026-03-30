import { Link } from "react-router-dom";
import { Search, MessageSquareText, BadgeCheck, Truck, History, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const journeySteps = [
  {
    icon: Search,
    step: "01",
    title: "Browse products or start with farmers",
    description:
      "Customers can open the marketplace from products or explore producer pages first to compare location, produce, and ratings.",
  },
  {
    icon: MessageSquareText,
    step: "02",
    title: "Send a request with quantity and note",
    description:
      "Instead of an instant cart checkout, the customer submits a request directly to the farmer with the needed quantity and any short message.",
  },
  {
    icon: BadgeCheck,
    step: "03",
    title: "Farmer approves or counters",
    description:
      "The farmer reviews the request, accepts it, declines it, or returns a counter-offer. Both sides can follow this inside Requests.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Confirm order and arrange delivery",
    description:
      "After approval, the customer confirms payment, then the order moves forward for pickup or third-party delivery coordination.",
  },
  {
    icon: History,
    step: "05",
    title: "Track everything in Requests and History",
    description:
      "Active negotiations stay in Requests, while completed or archived orders move into History so the full buying trail remains visible.",
  },
  {
    icon: Star,
    step: "06",
    title: "Leave feedback after fulfillment",
    description:
      "Once the farmer marks the order fulfilled, customers can review the product from History and leave a one-time farmer review from the producer page.",
  },
];

const HowItWorksSection = () => {
  const { user } = useAuth();
  const role = user?.user_metadata?.role;
  const productsHref = !user ? "/auth?mode=login" : role === "customer" ? "/products" : "/dashboard";
  const farmersHref = !user ? "/auth?mode=login" : role === "customer" ? "/farmers" : "/dashboard";

  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-[radial-gradient(circle_at_top,_hsl(var(--secondary)/0.15),_transparent_35%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))]"
    >
      <div className="container mx-auto px-4">
        <div className="grid xl:grid-cols-[1.05fr_1.35fr] gap-10 items-start">
          <div className="xl:sticky xl:top-28">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-5">
              A clearer buying flow from <span className="text-primary">discovery to delivery</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl">
              FarmMarket is built around direct farmer-customer requests. The flow is simple, but it gives both sides
              room to agree on quantity, timing, and final confirmation before delivery.
            </p>

            <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 shadow-soft space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Practical way to use the platform</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start from products when you know what you need, or open producer pages first if you want to compare
                  farms, trust signals, and available stock.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={productsHref}>
                  <Button size="lg">
                    Browse Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={farmersHref}>
                  <Button variant="outline" size="lg">
                    Explore Producers
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {journeySteps.map((step, index) => (
              <div
                key={step.step}
                className="group rounded-3xl border border-border/60 bg-card p-6 shadow-soft hover:shadow-medium hover:border-primary/20 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
