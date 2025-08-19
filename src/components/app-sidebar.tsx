"use client"

import * as React from "react"
import {

  IconChartBar,
  IconClipboardTextFilled,
  IconDashboardFilled,
  IconGiftFilled,
  IconHelpSquareFilled,
  IconLink,
  IconListDetails,
  IconMailFilled,
  IconSearch,
  IconSettingsFilled,
  IconUsers,
} from "@tabler/icons-react"

import { NavSidebar } from "@/components/nav-sidebar"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,

} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/studio/dashboard",
      icon: IconDashboardFilled,
    },
    {
      title: "Microsite",
      url: "/studio/microsite",
      icon: IconListDetails,
    },
    {
      title: "Links",
      url: "/studio/links",
      icon: IconLink,
    },
    {
      title: "Analytics",
      url: "/studio/analytics",
      icon: IconChartBar,
    },

    {
      title: "Orders",
      url: "/studio/orders",
      icon: IconClipboardTextFilled,
    },
  ],
  navMarketing: [
    {
      title: "Afiliates",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "E-Mail Marketing",
      url: "#",
      icon: IconMailFilled,
    },
    {
      title: "Vouchers",
      url: "#",
      icon: IconGiftFilled,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettingsFilled,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelpSquareFilled,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}  >
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavSidebar items={data.navMain} />
        <NavSidebar items={data.navMarketing} title="Marketing Tools" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  )
}
