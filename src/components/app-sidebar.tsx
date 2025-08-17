"use client"

import * as React from "react"
import {

  IconChartBar,
  IconDashboard,

  IconFolder,
  IconHelp,
  IconListDetails,

  IconSearch,
  IconSettings,
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
      icon: IconDashboard,
    },
    {
      title: "Microsite",
      url: "/studio/microsite",
      icon: IconListDetails,
    },
    {
      title: "Links",
      url: "/studio/links",
      icon: IconFolder,
    },
    {
      title: "Analytics",
      url: "/studio/analytics",
      icon: IconChartBar,
    },

    {
      title: "Orders",
      url: "/studio/orders",
      icon: IconUsers,
    },
  ],
  navMarketing: [
    {
      title: "Afiliates",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "E-Mail Marketing",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Vouchers",
      url: "#",
      icon: IconFolder,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
