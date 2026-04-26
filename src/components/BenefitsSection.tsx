import { CircleDollarSign, ShieldCheck, Truck, Users, Leaf, TrendingUp, Clock, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const farmerBenefits = {
  az: [
    {
      icon: CircleDollarSign,
      title: "Daha yüksək gəlir",
      description: "Vasitəçilər olmadan birbaşa satış edib hər təsdiqlənmiş sifarişdən daha çox gəlir əldə edin.",
    },
    {
      icon: Users,
      title: "Daha geniş bazar",
      description: "Ayrı satış kanalı qurulmadan Azərbaycanın şəhər alıcılarına çıxış əldə edin.",
    },
    {
      icon: TrendingUp,
      title: "İdarə panelində nəzarət",
      description: "Elanları, sorğuları, mövcudluğu və stok dəyişikliklərini bir paneldən idarə edin.",
    },
    {
      icon: MessageCircle,
      title: "Razılaşdırılmış sifarişlər",
      description: "Son təsdiqdən əvvəl müştəri sorğularını qəbul edin, rədd edin və ya qarşı təklif verin.",
    },
  ],
  en: [
  {
    icon: CircleDollarSign,
    title: "Higher Profits",
    description: "Sell directly without middlemen and keep more of each confirmed order.",
  },
  {
    icon: Users,
    title: "Wider Market Reach",
    description: "Reach urban buyers across Azerbaijan without building a separate sales channel.",
  },
  {
    icon: TrendingUp,
    title: "Dashboard Visibility",
    description: "Manage listings, requests, availability, and stock changes from one farmer dashboard.",
  },
  {
    icon: MessageCircle,
    title: "Negotiated Orders",
    description: "Accept, decline, or counter customer requests before the final confirmation happens.",
  },
  ],
};

const buyerBenefits = {
  az: [
    {
      icon: Leaf,
      title: "Təzə məhsul",
      description: "Məhsulları vasitəçilərin siyahılarından deyil, birbaşa yerli fermalardan tapın.",
    },
    {
      icon: ShieldCheck,
      title: "Təsdiqlənmiş istehsalçılar",
      description: "Fermer səhifələri, tarixçə və rəylər bir yerdə olduqda alıcı etibarı artır.",
    },
    {
      icon: Clock,
      title: "Çevik proses",
      description: "Müştərilər məhsulları müqayisə edib sorğu göndərə və hazır olduqda təsdiq edə bilirlər.",
    },
    {
      icon: Truck,
      title: "Çatdırılmaya hazır",
      description: "Sifariş prosesi götürmə və ya çatdırılma planlaması üçün ilkin olaraq hazırlanıb.",
    },
  ],
  en: [
  {
    icon: Leaf,
    title: "Fresh Produce",
    description: "Find products directly from local farms instead of browsing through middlemen listings.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Producers",
    description: "Buyer trust is stronger when farmer pages, history, and reviews are visible in one place.",
  },
  {
    icon: Clock,
    title: "Flexible Flow",
    description: "Customers can browse products, compare farmers, send requests, and confirm only when ready.",
  },
  {
    icon: Truck,
    title: "Delivery Ready",
    description: "The order flow is prepared for pickup or delivery planning as the transport milestone expands.",
  },
  ],
};

const BenefitsSection = () => {
  const { language } = useLanguage();
  const isAz = language === "az";
  return (
    <section id="about" className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            {isAz ? "FarmMarket haqqında" : "About FarmMarket"}
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            {isAz ? "Ümumi marketplace qarışıqlığı üçün deyil, birbaşa ticarət üçün qurulub" : "Built for direct trade, not generic marketplace noise"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {isAz
              ? "FarmMarket alıcıları və istehsalçıları sorğular, razılaşma, sifariş izlənməsi və rəylər vasitəsilə birləşdirir ki, hər iki tərəf daha şəffaf işləsin."
              : "FarmMarket connects buyers and producers through requests, negotiation, order tracking, and reviews, so both sides can work in a more transparent way."}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative bg-gradient-to-br from-primary/5 to-transparent rounded-3xl p-8 lg:p-10 border border-primary/10">
              <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  F
                </span>
                {isAz ? "Fermerlər üçün" : "For Farmers"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {farmerBenefits[language].map((benefit, index) => (
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

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
            <div className="relative bg-gradient-to-br from-secondary/10 to-transparent rounded-3xl p-8 lg:p-10 border border-secondary/20">
              <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-semibold text-secondary">
                  B
                </span>
                {isAz ? "Alıcılar üçün" : "For Buyers"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {buyerBenefits[language].map((benefit, index) => (
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
