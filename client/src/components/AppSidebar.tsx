import {
  // LayoutDashboard, // Tạm ẩn Dashboard
  Settings,
  Users,
  UserCircle,
  Calendar,
  AlertTriangle,
  FileText,
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
  Settings2,
  FolderOpen,
  BookOpen,
  ScrollText,
  Monitor,
  LogOut,
  ChevronUp,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { userProfileService } from "@/services/userProfileService";

// I. Quản trị hệ thống
const adminMenuItems = [
  // Dashboard tạm ẩn
  // {
  //   title: "Dashboard",
  //   url: "/",
  //   icon: LayoutDashboard,
  // },
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
    title: "Quản lý vai trò",
    url: "/admin/roles",
    icon: Shield,
  },
  {
    title: "Phân quyền",
    url: "/admin/permissions",
    icon: Settings2,
  },
  {
    title: "Thông tin liên hệ",
    url: "/config/contacts",
    icon: UserCircle,
  },
  {
    title: "Nhóm liên hệ",
    url: "/config/group-contacts",
    icon: FolderOpen,
  },
];

// II. Cấu hình hệ thống
const configMenuItems = [
  {
    title: "Cấp độ hệ thống (System Level)",
    url: "/config/system-levels",
    icon: TrendingUp,
  },
  {
    title: "Loại vận hành (Operation Types)",
    url: "/config/operation-types",
    icon: Tag,
  },
  {
    title: "Mức độ cảnh báo (Severity)",
    url: "/config/severity",
    icon: AlertTriangle,
  },
  {
    title: "Tần suất cảnh báo (Alert Frequency)",
    url: "/config/alert-frequency",
    icon: Clock,
  },
  {
    title: "Lịch trực ca (Schedules)",
    url: "/config/schedules",
    icon: Calendar,
  },
 {
    title: "Danh sách hệ thống (System Catalog)",
    url: "/config/system-catalog",
    icon: Monitor,
  },
  {
    title: "Quy tắc cảnh báo (Alert Rule)",
    url: "/config/alert-rules-management",
    icon: Bell,
  },
];

// III. Giám sát & Tra cứu
const monitorMenuItems = [
  {
    title: "Từ điển mã lỗi (Error Dictionary)",
    url: "/config/error-dictionary",
    icon: BookOpen,
  },
  {
    title: "Tra cứu Log phát sinh (Log Entries)",
    url: "/config/log-entries",
    icon: ScrollText,
  },
  
];

// IV. Báo cáo, thống kê
// const reportMenuItems = [
//   {
//     title: "Báo cáo ca trực",
//     url: "/reports/shifts",
//     icon: FileBarChart,
//   },
//   {
//     title: "Lịch sử cảnh báo",
//     url: "/reports/alert-history",
//     icon: History,
//   },
// ];

export function AppSidebar() {
  const [location] = useLocation();

  // Fetch current user profile
  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const response = await userProfileService.getCurrentProfile();
        return response.data;
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }
    },
    retry: 1,
  });

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            Giám sát & Tra cứu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monitorMenuItems.map((item) => (
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
        {/* <SidebarGroup>
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
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                {profileData ? getInitials(profileData.fullName) : <UserCircle className="h-4 w-4" />}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs font-medium">{profileData?.fullName || "Người dùng"}</span>
                <span className="text-[10px] text-muted-foreground">
                  {profileData?.departmentName || "Đang tải..."}
                </span>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              <div className="flex flex-col space-y-1">
                <p className="font-medium">{profileData?.fullName || "Người dùng"}</p>
                <p className="text-[10px] text-muted-foreground font-normal">
                  {profileData?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Thông tin cá nhân</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                // Handle logout
                localStorage.removeItem('trucca_access_token');
                localStorage.removeItem('trucca_refresh_token');
                window.location.href = '/login';
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
