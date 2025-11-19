import { useState } from "react";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

interface LoginResponse {
  token: string;
  refreshToken: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      console.log("Login response:", { status: response.status, data });

      // Kiểm tra có token không
      if (!data.token || !data.refreshToken) {
        throw new Error("Đăng nhập thất bại");
      }

      return data as LoginResponse;
    },
    onSuccess: (data) => {
      login(data.token, data.refreshToken);
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đến với Trực Ca AI",
      });
      // Delay để state kịp update
      setTimeout(() => {
        setLocation("/");
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên đăng nhập và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ username, password });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/backgrounds/bg.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/images/logos/mobifone.svg"
              alt="MobiFone Logo"
              className="h-10 w-auto"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Hệ thống Trực Ca AI</CardTitle>
          <CardDescription className="text-sm italic text-muted-foreground">
           Hỗ trợ giám sát, cảnh báo, phân tích tình trạng hoạt động các hệ thống kỹ thuật – vận hành – CNTT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="username"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <span className="mr-2">Đang đăng nhập...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>© 2025 MobiFone - Trực Ca AI. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
