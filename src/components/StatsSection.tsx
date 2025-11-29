import { TrendingUp, Users, Package, MapPin } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "5,000+",
    label: "Active Farmers",
    description: "Verified sellers across Azerbaijan",
  },
  {
    icon: Package,
    value: "50,000+",
    label: "Products Listed",
    description: "Fresh produce available daily",
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Farmer Satisfaction",
    description: "Report increased income",
  },
  {
    icon: MapPin,
    value: "60+",
    label: "Regions Covered",
    description: "Delivering across Azerbaijan",
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 lg:py-24 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-foreground rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Transforming Agricultural Trade in Azerbaijan
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Join thousands of farmers and buyers who are already benefiting from direct trade
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center p-6 lg:p-8 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-secondary" />
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </p>
              <p className="font-semibold text-primary-foreground/90 mb-1">{stat.label}</p>
              <p className="text-sm text-primary-foreground/60">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
