import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Phone, Building2, Calendar, Save, Loader2 } from "lucide-react";
import { userProfileService } from "@/services/userProfileService";
import { useToast } from "@/hooks/use-toast";
import type { UpdateProfileRequest } from "@/types/user-profile";
import { queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await userProfileService.getCurrentProfile();
      return response.data;
    },
  });

  // Form state for editing
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      return await userProfileService.updateProfile(data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "Thành công",
        description: response.message || "Thông tin cá nhân đã được cập nhật",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone || "",
        avatar: profileData.avatar || "",
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profileData.avatar} alt={profileData.fullName} />
              <AvatarFallback className="text-3xl">
                {getInitials(profileData.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">{profileData.fullName}</h3>
              <p className="text-sm text-muted-foreground">@{profileData.username}</p>
              {profileData.status === 1 ? (
                <Badge variant="default">Đang hoạt động</Badge>
              ) : (
                <Badge variant="destructive">Không hoạt động</Badge>
              )}
            </div>
            <Separator />
            <div className="w-full space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Đơn vị:</span>
                <span className="font-medium">{profileData.departmentName || "Chưa có"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tham gia:</span>
                <span className="font-medium">{formatDateTime(profileData.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thông tin chi tiết</CardTitle>
                <CardDescription>Cập nhật thông tin liên hệ và cá nhân</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit}>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.fullName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.username}</span>
                  <Badge variant="outline" className="ml-auto">Không thể thay đổi</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập địa chỉ email"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone || "Chưa cập nhật"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="avatar">URL Avatar</Label>
                {isEditing ? (
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="Nhập URL ảnh đại diện"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{profileData.avatar || "Chưa cập nhật"}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                    Hủy
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Ngày tạo:</span> {formatDateTime(profileData.createdAt)}
              </div>
              <div>
                <span className="font-medium">Cập nhật lần cuối:</span> {formatDateTime(profileData.updatedAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
