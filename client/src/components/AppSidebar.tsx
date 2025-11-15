import {
  LayoutDashboard,
  Settings,
  Users,
  UserCircle,
  Calendar,
  AlertTriangle,
  FileText,
  Database,
  Shield,
  UserCog,
  Layers,
  Clock,
  Bell,
  Server,
  Zap,
  BarChart3,
  History,
  FileBarChart,
  Tag,
  TrendingUp,
  Building2,
} from "lucide-react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

// I. Quản trị hệ thống
const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý người dùng",
    url: "/admin/users",
    icon: UserCog,
  },
  {
    title: "Quản lý nhóm người dùng",
    url: "/admin/user-groups",
    icon: Users,
  },
  {
    title: "Quản lý đơn vị",
    url: "/admin/departments",
    icon: Building2,
  },
  {
    title: "Phân quyền",
    url: "/admin/permissions",
    icon: Shield,
  },
];

// II. Cấu hình hệ thống
const configMenuItems = [
  {
    title: "Danh sách hệ thống",
    url: "/config/systems",
    icon: Database,
  },
  {
    title: "Loại vận hành",
    url: "/config/operation-types",
    icon: Tag,
  },
  {
    title: "Cấp độ hệ thống",
    url: "/config/system-levels",
    icon: TrendingUp,
  },
  {
    title: "Thông tin liên hệ (Contacts)",
    url: "/config/contacts",
    icon: UserCircle,
  },
  {
    title: "Nhóm liên hệ (Contacts Groups)",
    url: "/config/groups",
    icon: Layers,
  },
  {
    title: "Quy tắc cảnh báo (Alert Rules)",
    url: "/config/alert-rules",
    icon: Settings,
  },
  {
    title: "Lịch trực ca (Schedules)",
    url: "/config/schedules",
    icon: Calendar,
  },
  {
    title: "Cấu hình cảnh báo",
    url: "/config/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Cấu hình thông báo",
    url: "/config/notifications",
    icon: Bell,
  },
  {
    title: "Cấu hình Incidents",
    url: "/config/incidents",
    icon: Zap,
  },
  {
    title: "Cấu hình Log Analysis",
    url: "/config/log-analysis",
    icon: FileText,
  },
  {
    title: "Cấu hình Servers",
    url: "/config/servers",
    icon: Server,
  },
];

// III. Báo cáo, thống kê
const reportMenuItems = [
  {
    title: "Báo cáo ca trực",
    url: "/reports/shifts",
    icon: FileBarChart,
  },
  {
    title: "Lịch sử cảnh báo",
    url: "/reports/alert-history",
    icon: History,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img
            src="/images/logos/logo.png"
            className="h-10 w-auto"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Trực Ca AI</span>
            <span className="text-[10px] text-muted-foreground">Giám sát thông minh</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase text-primary">
            Quản trị hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase text-primary">
            Cấu hình hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase text-primary">
            Báo cáo, thống kê
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <UserCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">Admin User</span>
            <span className="text-[10px] text-muted-foreground">Quản trị viên</span>
          </div>
        </div>
        <div className="border-t pt-3 flex items-center justify-between">
          <img
            src="/images/logos/mobifone.svg"
            alt="MobiFone"
            className="h-3.5 w-auto opacity-60"
          />
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-medium text-muted-foreground">Version 1.0</span>
            <span className="text-[9px] text-muted-foreground">Release 10/2025</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
