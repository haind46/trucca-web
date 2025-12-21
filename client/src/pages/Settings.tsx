import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Key, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { userProfileService } from "@/services/userProfileService";
import { useToast } from "@/hooks/use-toast";
import type { ChangePasswordRequest } from "@/types/user-profile";

export default function Settings() {
  const { toast } = useToast();

  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      return await userProfileService.changePassword(data);
    },
    onSuccess: (response) => {
      toast({
        title: "Thành công",
        description: response.message || "Mật khẩu đã được thay đổi",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thay đổi mật khẩu",
        variant: "destructive",
      });
    },
  });

  const validatePassword = () => {
    const errors: typeof passwordErrors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = () => {
    if (validatePassword()) {
      changePasswordMutation.mutate(passwordData);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: "Yếu", color: "text-red-500" };
    if (strength <= 3) return { strength, text: "Trung bình", color: "text-yellow-500" };
    return { strength, text: "Mạnh", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">Quản lý cài đặt tài khoản và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>Cập nhật mật khẩu của bạn để bảo mật tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Mật khẩu phải có ít nhất 6 ký tự. Nên sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                Mật khẩu hiện tại *
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, currentPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, currentPassword: undefined });
                }}
                placeholder="Nhập mật khẩu hiện tại"
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                Mật khẩu mới *
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, newPassword: undefined });
                }}
                placeholder="Nhập mật khẩu mới"
              />
              {passwordData.newPassword && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Độ mạnh:</span>
                  <span className={passwordStrength.color}>{passwordStrength.text}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden ml-2">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.strength <= 2
                          ? "bg-red-500"
                          : passwordStrength.strength <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Xác nhận mật khẩu mới *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                }}
                placeholder="Nhập lại mật khẩu mới"
              />
              {passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Mật khẩu khớp
                </p>
              )}
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <Separator />

            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="w-full"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang thay đổi...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Đổi mật khẩu
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Mẹo bảo mật
            </CardTitle>
            <CardDescription>Giữ tài khoản của bạn an toàn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-sm">Sử dụng mật khẩu mạnh</h4>
                  <p className="text-sm text-muted-foreground">
                    Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-sm">Không chia sẻ mật khẩu</h4>
                  <p className="text-sm text-muted-foreground">
                    Không bao giờ chia sẻ mật khẩu của bạn với bất kỳ ai, kể cả đồng nghiệp hay quản trị viên.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-sm">Thay đổi mật khẩu định kỳ</h4>
                  <p className="text-sm text-muted-foreground">
                    Nên thay đổi mật khẩu của bạn ít nhất 3-6 tháng một lần để tăng cường bảo mật.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-sm">Đăng xuất khi không sử dụng</h4>
                  <p className="text-sm text-muted-foreground">
                    Luôn đăng xuất khỏi tài khoản khi sử dụng máy tính dùng chung hoặc rời khỏi máy.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  5
                </div>
                <div>
                  <h4 className="font-medium text-sm">Kiểm tra hoạt động đăng nhập</h4>
                  <p className="text-sm text-muted-foreground">
                    Nếu bạn phát hiện hoạt động bất thường, hãy đổi mật khẩu ngay lập tức.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Lưu ý:</strong> Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại trên tất cả các thiết bị.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
