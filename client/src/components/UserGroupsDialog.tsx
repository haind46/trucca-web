import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, X } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS, getApiUrl } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Group {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface UserGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  username: string;
}

export function UserGroupsDialog({
  open,
  onOpenChange,
  userId,
  username,
}: UserGroupsDialogProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tất cả groups
  const { data: allGroupsData } = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => {
      const response = await fetchWithAuth(
        getApiUrl(API_ENDPOINTS.SYS_GROUPS.LIST, { page: 1, limit: 100, sort_dir: 'asc', sort_key: 'name' })
      );

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const result = await response.json();
      return result.data.data as Group[];
    },
    enabled: open,
  });

  // Fetch groups hiện tại của user
  const { data: userGroupsData, isLoading } = useQuery({
    queryKey: ["user-groups", userId],
    queryFn: async () => {
      if (!userId) return [];

      const response = await fetchWithAuth(
        API_ENDPOINTS.USERS.GROUPS(userId)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user groups");
      }

      const result = await response.json();
      console.log("👥 User groups response:", result);
      // Backend returns data.items (not just data)
      const groups = (result.data?.items || []).map((item: any) => item.group);
      console.log("👥 Extracted groups:", groups);
      return groups as Group[];
    },
    enabled: !!userId && open,
  });

  // Update selectedGroupIds khi data load xong
  useEffect(() => {
    if (userGroupsData) {
      setSelectedGroupIds(new Set(userGroupsData.map((g) => g.id)));
    }
  }, [userGroupsData]);

  // Mutation update groups
  const updateGroupsMutation = useMutation({
    mutationFn: async (groupIds: number[]) => {
      if (!userId) throw new Error("User ID is required");

      const response = await fetchWithAuth(
        API_ENDPOINTS.USERS.GROUPS(userId),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupIds }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user groups");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật nhóm cho người dùng",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleGroup = (groupId: number, checked: boolean) => {
    const newSelected = new Set(selectedGroupIds);
    if (checked) {
      newSelected.add(groupId);
    } else {
      newSelected.delete(groupId);
    }
    setSelectedGroupIds(newSelected);
  };

  const handleSelectAll = () => {
    if (allGroupsData) {
      setSelectedGroupIds(new Set(allGroupsData.map((g) => g.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedGroupIds(new Set());
  };

  const handleSave = () => {
    updateGroupsMutation.mutate(Array.from(selectedGroupIds));
  };

  const allGroups = allGroupsData || [];
  const userGroups = userGroupsData || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quản lý nhóm người dùng
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa nhóm cho người dùng: <strong>{username}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current groups */}
          <div>
            <Label className="text-sm font-medium">Nhóm hiện tại:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {userGroups.length === 0 ? (
                <span className="text-sm text-gray-500">Chưa thuộc nhóm nào</span>
              ) : (
                userGroups.map((group) => (
                  <Badge key={group.id} variant="default">
                    {group.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              Chọn tất cả
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
            >
              Bỏ chọn tất cả
            </Button>
          </div>

          {/* Group list */}
          <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Đang tải...</div>
            ) : allGroups.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Không có nhóm nào
              </div>
            ) : (
              allGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroupIds.has(group.id)}
                    onCheckedChange={(checked) =>
                      handleToggleGroup(group.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`group-${group.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{group.name}</div>
                    <div className="text-sm text-gray-500">
                      Mã: {group.code}
                    </div>
                  </label>
                  <Badge
                    variant={group.status === "active" ? "default" : "secondary"}
                  >
                    {group.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateGroupsMutation.isPending}
          >
            {updateGroupsMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
