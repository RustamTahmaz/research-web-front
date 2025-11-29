import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Truck } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fresh produce from Azerbaijan farms"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-soft" />
            Connecting Farmers & Buyers Directly
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in-up delay-100">
            Fresh From{" "}
            <span className="relative">
              <span className="relative z-10 text-secondary">Azerbaijan's</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-secondary/30 -z-0 rounded" />
            </span>{" "}
            Fields to Your Table
          </h1>

          {/* Description */}
          <p className="text-lg lg:text-xl text-primary-foreground/80 mb-8 max-w-2xl animate-fade-in-up delay-200">
            Discover the freshest local produce from small farmers across Azerbaijan. 
            No middlemen, fair prices, and farm-fresh quality delivered to your doorstep.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up delay-300">
            <Button variant="heroGolden" size="xl" className="group">
              Browse Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Start Selling
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 lg:gap-12 animate-fade-in-up delay-400">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-primary-foreground">5,000+</p>
                <p className="text-xs lg:text-sm text-primary-foreground/60">Active Farmers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-primary-foreground">30%</p>
                <p className="text-xs lg:text-sm text-primary-foreground/60">Better Prices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-primary-foreground">24hr</p>
                <p className="text-xs lg:text-sm text-primary-foreground/60">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
