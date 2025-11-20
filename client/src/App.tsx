import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Alerts from "@/pages/Alerts";
import Schedules from "@/pages/Schedules";
import Reports from "@/pages/Reports";
import ConfigSystems from "@/pages/ConfigSystems";
import ConfigOperationTypes from "@/pages/ConfigOperationTypes";
import ConfigSystemLevel from "@/pages/ConfigSystemLevel";
import ConfigRoles from "@/pages/ConfigRoles";
import ConfigAlertFrequency from "@/pages/ConfigAlertFrequency";
import ConfigContacts from "@/pages/ConfigContacts";
import ConfigGroupContacts from "@/pages/ConfigGroupContacts";
import ConfigGroups from "@/pages/ConfigGroups";
import ConfigRules from "@/pages/ConfigRules";
import UserManagement from "@/pages/UserManagement";
import UserGroupManagement from "@/pages/UserGroupManagement";
import DepartmentManagement from "@/pages/DepartmentManagement";
import PermissionManagement from "@/pages/PermissionManagement";
import ScheduleManagement from "@/pages/ScheduleManagement";
import UnderDevelopment from "@/pages/UnderDevelopment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* I. Quản trị hệ thống */}
      <Route path="/" component={Dashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/user-groups" component={UserGroupManagement} />
      <Route path="/admin/departments" component={DepartmentManagement} />
      <Route path="/admin/roles" component={ConfigRoles} />
      <Route path="/admin/permissions" component={PermissionManagement} />

      {/* II. Cấu hình hệ thống */}
      <Route path="/config/systems" component={ConfigSystems} />
      <Route path="/config/operation-types" component={ConfigOperationTypes} />
      <Route path="/config/system-levels" component={ConfigSystemLevel} />
      <Route path="/config/alert-frequency" component={ConfigAlertFrequency} />
      <Route path="/config/contacts" component={ConfigContacts} />
      <Route path="/config/group-contacts" component={ConfigGroupContacts} />
      <Route path="/config/groups" component={ConfigGroups} />
      <Route path="/config/alert-rules" component={ConfigRules} />
      <Route path="/config/schedules" component={ScheduleManagement} />
      <Route path="/config/alerts" component={UnderDevelopment} />
      <Route path="/config/notifications" component={UnderDevelopment} />
      <Route path="/config/incidents" component={UnderDevelopment} />
      <Route path="/config/log-analysis" component={UnderDevelopment} />
      <Route path="/config/servers" component={UnderDevelopment} />

      {/* III. Báo cáo, thống kê */}
      <Route path="/reports/dashboard" component={UnderDevelopment} />
      <Route path="/reports/shifts" component={UnderDevelopment} />
      <Route path="/reports/alert-history" component={UnderDevelopment} />

      {/* Legacy routes - keeping for backward compatibility */}
      <Route path="/alerts" component={Alerts} />
      <Route path="/schedules" component={Schedules} />
      <Route path="/reports" component={Reports} />
      <Route path="/config/rules" component={ConfigRules} />

      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedApp() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="text-xl font-semibold">MOBIFONE - HỆ THỐNG TRỰC CA AI</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route>
            <ProtectedRoute>
              <ProtectedApp />
            </ProtectedRoute>
          </Route>
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
