import { useLocation, Link } from "wouter";
import { LayoutDashboard, Users, BookOpen, Guitar, CalendarDays } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "대시보드", href: "/", icon: LayoutDashboard },
  { title: "학생 관리", href: "/students", icon: Users },
  { title: "커리큘럼", href: "/curriculum", icon: BookOpen },
  { title: "레슨 일정", href: "/schedule", icon: CalendarDays },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Guitar className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Guitar Lesson</p>
            <p className="text-xs text-muted-foreground leading-tight">레슨 관리</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? location === "/"
                    : location.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent font-medium" : ""}
                    >
                      <Link href={item.href} data-testid={`nav-${item.href.replace("/", "") || "home"}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
