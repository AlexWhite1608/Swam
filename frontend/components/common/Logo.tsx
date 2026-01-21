import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      <Image
        src="/assets/logo.svg"
        alt="Logo"
        width={48}
        height={48}
        priority
      />
      <span className="text-primary">Camplendar</span>
    </Link>
  );
}