"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconHelp } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import ThemeSwitch from "./layout/theme-switch";
export function SiteHeader() {
  const pathname = usePathname();
  const page = {
    "/studio/dashboard": "Dashboard",
    "/studio/microsite": "Microsite",
    "/studio/links": "Links",
    "/studio/analytics": "Analytics",
    "/studio/orders": "Orders",
  };
  const pageName = page[pathname as keyof typeof page];

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="md:hidden" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 md:hidden"
        />
        <h1 className="text-xl font-bold">{pageName}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={"ghost"}
            asChild
            size="icon"
            className="hidden sm:flex"
          >
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="d  ark:text-foreground"
            >
              <IconHelp />
            </a>
          </Button>
        </div>
        <ThemeSwitch />
      </div>
    </header>
  );
}
