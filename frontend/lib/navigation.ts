import { BedDouble, CalendarCheck, CalendarDays, Coins, HomeIcon, Users } from "lucide-react";

export const NAV_ITEMS = [
  {
    name: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Prenotazioni",
    href: "/bookings",
    icon: CalendarCheck,
  },
  {
    name: "Risorse",
    href: "/resources",
    icon: BedDouble,
  },
  {
    name: "Clienti",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Prezzi",
    href: "/pricing",
    icon: Coins,
  },
];

// Utility function to get nav item name by href
export function getNavNameByHref(href: string): string | undefined {
  const item = NAV_ITEMS.find((i) => i.href === href);
  return item?.name;
}
