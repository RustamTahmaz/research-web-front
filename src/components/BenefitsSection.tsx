import { CircleDollarSign, ShieldCheck, Truck, Users, Leaf, TrendingUp, Clock, MessageCircle } from "lucide-react";

const farmerBenefits = [
  {
    icon: CircleDollarSign,
    title: "Higher Profits",
    description: "Sell directly without middlemen and keep up to 30% more of your earnings.",
  },
  {
    icon: Users,
    title: "Wider Market Reach",
    description: "Access thousands of urban buyers across Azerbaijan from your farm.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Track your sales, popular products, and customer preferences with our dashboard.",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with buyers to negotiate and build lasting relationships.",
  },
];

const buyerBenefits = [
  {
    icon: Leaf,
    title: "Farm-Fresh Quality",
    description: "Get produce harvested within 24-48 hours, delivered fresh to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Farmers",
    description: "Every farmer is verified. Know exactly where your food comes from.",
  },
  {
    icon: Clock,
    title: "Convenient Shopping",
    description: "Browse, order, and schedule deliveries that fit your lifestyle.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Track your orders in real-time with our trusted logistics partners.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            Benefits for <span className="text-primary">Everyone</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            FarmMarket creates value for farmers and buyers alike, building a sustainable food ecosystem
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Farmer Benefits */}
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative bg-gradient-to-br from-primary/5 to-transparent rounded-3xl p-8 lg:p-10 border border-primary/10">
              <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  🌾
                </span>
                For Farmers
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {farmerBenefits.map((benefit, index) => (
                  <div 
                    key={benefit.title} 
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buyer Benefits */}
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
            <div className="relative bg-gradient-to-br from-secondary/10 to-transparent rounded-3xl p-8 lg:p-10 border border-secondary/20">
              <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  🛒
                </span>
                For Buyers
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {buyerBenefits.map((benefit, index) => (
                  <div 
                    key={benefit.title} 
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-3 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-6 h-6 text-secondary group-hover:text-secondary-foreground transition-colors" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
