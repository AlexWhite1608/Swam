import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-semibold overflow-hidden"
    >
      <Image
        src="/assets/logo.svg"
        alt="Logo"
        width={48}
        height={48}
        priority
        className="size-12 group-data-[collapsible=icon]:size-8 transition-all shrink-0 group-data-[collapsible=icon]:mt-2"
      />

      <span className="text-primary transition-all group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
        Camplendar
      </span>
    </Link>
  );
}
