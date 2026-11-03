import { DashboardConfig } from "types"

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Membership",
      href: "/desk/membership",
    },
    {
      title: "Support",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Feed",
      href: "/desk/feed",
      icon: "post",
    },
    {
      title: "Trade Setups",
      href: "/desk/setups",
      icon: "lineChart",
    },
    {
      title: "Academy",
      href: "/desk/academy",
      icon: "post",
    },
    {
      title: "Chart Reviews",
      href: "/desk/reviews",
      icon: "search",
    },
  ],
}
