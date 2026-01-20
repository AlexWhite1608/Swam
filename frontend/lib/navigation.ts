import { BedDouble, CalendarDays, Coins, Users } from "lucide-react";

export const NAV_ITEMS = [
  { 
    name: "Home", 
    href: "/", 
    icon: CalendarDays 
  },
  { 
    name: "Risorse", 
    href: "/resources", 
    icon: BedDouble 
  },
  { 
    name: "Clienti", 
    href: "/customers", 
    icon: Users 
  },
  { 
    name: "Prezzi", 
    href: "/pricing", 
    icon: Coins 
  },
];

// Utility function to get nav item name by href
export function getNavNameByHref(href: string): string | undefined {
  const item = NAV_ITEMS.find(i => i.href === href);
  return item?.name;
}