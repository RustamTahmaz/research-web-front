import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ShoppingCart } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-deep-green p-8 lg:p-16">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Join Azerbaijan's Largest Farm Marketplace?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Whether you're a farmer looking to expand your reach or a buyer seeking fresh, quality produce - 
                FarmMarket connects you directly. No middlemen, fair prices, farm-fresh quality.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="heroGolden" size="xl" className="group">
                  <ShoppingCart className="w-5 h-5" />
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="heroOutline" size="xl" className="group">
                  <Leaf className="w-5 h-5" />
                  Register as Farmer
                </Button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                <p className="text-4xl font-bold text-secondary mb-2">0%</p>
                <p className="text-primary-foreground/90 font-medium">Commission Fee</p>
                <p className="text-sm text-primary-foreground/60 mt-1">For the first 3 months</p>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                <p className="text-4xl font-bold text-secondary mb-2">24/7</p>
                <p className="text-primary-foreground/90 font-medium">Support Available</p>
                <p className="text-sm text-primary-foreground/60 mt-1">In Azerbaijani & Russian</p>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                <p className="text-4xl font-bold text-secondary mb-2">Free</p>
                <p className="text-primary-foreground/90 font-medium">Farmer Training</p>
                <p className="text-sm text-primary-foreground/60 mt-1">Digital literacy courses</p>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                <p className="text-4xl font-bold text-secondary mb-2">Fast</p>
                <p className="text-primary-foreground/90 font-medium">Payouts</p>
                <p className="text-sm text-primary-foreground/60 mt-1">Within 48 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
