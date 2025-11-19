import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GroupForm } from "@/components/GroupForm";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Group, InsertGroup } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ConfigGroups() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: [API_ENDPOINTS.GROUPS.LIST],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: InsertGroup) => {
      return await apiRequest("POST", API_ENDPOINTS.GROUPS.LIST, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.GROUPS.LIST] });
      setDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Đã tạo group mới",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateGroup = (data: InsertGroup) => {
    createGroupMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Groups</h1>
          <p className="text-sm text-muted-foreground">
            Nhóm vận hành và phân quyền cảnh báo
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-group">
              <Plus className="h-4 w-4 mr-2" />
              Thêm group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo group mới</DialogTitle>
            </DialogHeader>
            <GroupForm
              onSubmit={handleCreateGroup}
              isPending={createGroupMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách groups</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Chưa có group nào. Nhấn "Thêm group" để tạo group mới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border rounded-md space-y-2 hover-elevate cursor-pointer"
                  data-testid={`group-card-${group.id}`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{group.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{group.memberIds.length} thành viên</Badge>
                      {group.chatworkGroupId && (
                        <span className="font-mono text-xs">{group.chatworkGroupId}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
