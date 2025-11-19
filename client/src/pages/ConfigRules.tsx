import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { AlertRuleForm } from "@/components/AlertRuleForm";
import { Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
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
import type { AlertRule, InsertAlertRule } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ConfigRules() {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: rules = [], isLoading } = useQuery<AlertRule[]>({
    queryKey: [API_ENDPOINTS.RULES.LIST],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAlertRule) => {
      return await apiRequest("POST", API_ENDPOINTS.RULES.LIST, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.RULES.LIST] });
      setOpen(false);
      toast({
        title: "Thành công",
        description: "Alert rule đã được tạo",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.RULES.LIST] });
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
      toast({
        title: "Thành công",
        description: "Alert rule đã được xóa",
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

  const handleSubmit = (data: InsertAlertRule) => {
    createMutation.mutate(data);
  };

  const handleDeleteClick = (id: number) => {
    setRuleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (ruleToDelete !== null) {
      deleteMutation.mutate(ruleToDelete);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Alert Rules</h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình quy tắc phát hiện và cảnh báo sự cố
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-rule">
              <Plus className="h-4 w-4 mr-2" />
              Thêm rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm alert rule mới</DialogTitle>
            </DialogHeader>
            <AlertRuleForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách rules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : rules.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Chưa có alert rule nào
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                  data-testid={`rule-row-${rule.id}`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      <StatusBadge severity={rule.severity as any} />
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {rule.condition}
                    </div>
                    {rule.description && (
                      <div className="text-sm text-muted-foreground">
                        {rule.description}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(rule.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-rule-${rule.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa alert rule này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
