"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getNavNameByHref } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import React from "react";
import { UserAvatar } from "@/components/common/UserAvatar";

export function AppHeader() {
  const pathname = usePathname();

  // breadcrumb logic: remove leading slash and split by "/"
  const paths = pathname === "/" ? [] : pathname.split("/").filter((p) => p);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50 backdrop-blur-sm bg-white/80 shadow-sm">
      <SidebarTrigger className="-ml-2" />

      <div className="w-full flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {paths.map((path, index) => {
              const href = `/${paths.slice(0, index + 1).join("/")}`;
              const isLast = index === paths.length - 1;
              const navName =
                getNavNameByHref(href) ||
                path.charAt(0).toUpperCase() + path.slice(1);

              return (
                <React.Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{navName}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{navName}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <UserAvatar />
    </header>
  );
}
