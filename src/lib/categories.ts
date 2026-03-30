import { Apple, Egg, Milk, Hexagon, Leaf, Nut, Sprout } from "lucide-react";
import PeachIcon from "@/components/icons/PeachIcon";

export const CATEGORIES = [
  { name: "Fruits", icon: Apple, color: "bg-red-100 text-red-600" },
  { name: "Vegetables", icon: PeachIcon, color: "bg-orange-100 text-orange-600" },
  { name: "Dairy", icon: Milk, color: "bg-blue-100 text-blue-600" },
  { name: "Eggs", icon: Egg, color: "bg-amber-100 text-amber-600" },
  { name: "Honey", icon: Hexagon, color: "bg-yellow-100 text-yellow-700" },
  { name: "Herbs", icon: Leaf, color: "bg-lime-100 text-lime-700" },
  { name: "Nuts", icon: Nut, color: "bg-orange-100 text-orange-700" },
  { name: "Tea", icon: Sprout, color: "bg-teal-100 text-teal-700" },
];

export const CATEGORY_OPTIONS = CATEGORIES.map((category) => category.name);
