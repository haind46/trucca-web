import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { SystemForm } from "@/components/SystemForm";
import { Plus, Settings, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { System, InsertSystem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ConfigSystems() {
  const [open, setOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [deletingSystemId, setDeletingSystemId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: systems = [], isLoading } = useQuery<System[]>({
    queryKey: [API_ENDPOINTS.SYSTEMS.LIST],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSystem) => {
      return await apiRequest("POST", API_ENDPOINTS.SYSTEMS.LIST, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SYSTEMS.LIST] });
      toast({
        title: "Thành công",
        description: "Hệ thống đã được thêm mới",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSystem> }) => {
      return await apiRequest("PATCH", `/api/systems/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SYSTEMS.LIST] });
      toast({
        title: "Thành công",
        description: "Hệ thống đã được cập nhật",
      });
      setEditingSystem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/systems/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SYSTEMS.LIST] });
      toast({
        title: "Thành công",
        description: "Hệ thống đã được xóa",
      });
      setDeletingSystemId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
      setDeletingSystemId(null);
    },
  });

  const handleCreate = (data: InsertSystem) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: InsertSystem) => {
    if (editingSystem) {
      updateMutation.mutate({ id: editingSystem.id, data });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Hệ thống</h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình và quản lý các hệ thống giám sát
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-system">
              <Plus className="h-4 w-4 mr-2" />
              Thêm hệ thống
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm hệ thống mới</DialogTitle>
            </DialogHeader>
            <SystemForm onSubmit={handleCreate} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="loading-systems">
              Đang tải...
            </div>
          ) : systems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="empty-systems">
              Chưa có hệ thống nào. Nhấn "Thêm hệ thống" để bắt đầu.
            </div>
          ) : (
            <div className="space-y-3">
              {systems.map((system) => (
                <div
                  key={system.id}
                  className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                  data-testid={`system-row-${system.id}`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{system.name}</span>
                      <Badge variant="secondary">Level {system.level}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {system.ip}
                      {system.polestarCode && ` • PoleStar: ${system.polestarCode}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSystem(system)}
                      data-testid={`button-edit-${system.id}`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Cấu hình
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingSystemId(system.id)}
                      data-testid={`button-delete-${system.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingSystem} onOpenChange={(open) => !open && setEditingSystem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật hệ thống</DialogTitle>
          </DialogHeader>
          {editingSystem && (
            <SystemForm
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              defaultValues={{
                name: editingSystem.name,
                ip: editingSystem.ip,
                level: editingSystem.level,
                polestarCode: editingSystem.polestarCode || "",
                chatworkGroupId: editingSystem.chatworkGroupId || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingSystemId} onOpenChange={(open) => !open && setDeletingSystemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa hệ thống</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hệ thống này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSystemId && handleDelete(deletingSystemId)}
              data-testid="button-confirm-delete"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
