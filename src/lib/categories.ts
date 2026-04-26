import { Apple, Egg, Milk, Hexagon, Leaf, Nut, Sprout } from "lucide-react";
import PeachIcon from "@/components/icons/PeachIcon";
import type { Language } from "@/i18n/LanguageProvider";

export const CATEGORIES = [
  { name: "Fruits", labelAz: "Meyvələr", labelEn: "Fruits", icon: Apple, color: "bg-red-100 text-red-600" },
  { name: "Vegetables", labelAz: "Tərəvəzlər", labelEn: "Vegetables", icon: PeachIcon, color: "bg-orange-100 text-orange-600" },
  { name: "Dairy", labelAz: "Süd məhsulları", labelEn: "Dairy", icon: Milk, color: "bg-blue-100 text-blue-600" },
  { name: "Eggs", labelAz: "Yumurta", labelEn: "Eggs", icon: Egg, color: "bg-amber-100 text-amber-600" },
  { name: "Honey", labelAz: "Bal", labelEn: "Honey", icon: Hexagon, color: "bg-yellow-100 text-yellow-700" },
  { name: "Herbs", labelAz: "Otlar", labelEn: "Herbs", icon: Leaf, color: "bg-lime-100 text-lime-700" },
  { name: "Nuts", labelAz: "Qoz-fındıq", labelEn: "Nuts", icon: Nut, color: "bg-orange-100 text-orange-700" },
  { name: "Tea", labelAz: "Çay", labelEn: "Tea", icon: Sprout, color: "bg-teal-100 text-teal-700" },
];

export const CATEGORY_OPTIONS = CATEGORIES.map((category) => category.name);

export const getCategoryLabel = (categoryName: string, language: Language) => {
  const category = CATEGORIES.find((item) => item.name === categoryName);
  if (!category) return categoryName;
  return language === "az" ? category.labelAz : category.labelEn;
};
