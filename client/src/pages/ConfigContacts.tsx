import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ContactForm";
import { Plus, Mail, Phone, Trash2 } from "lucide-react";
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
import type { Contact, InsertContact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ConfigContacts() {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: [API_ENDPOINTS.CONTACTS.LIST],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      return await apiRequest("POST", API_ENDPOINTS.CONTACTS.LIST, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CONTACTS.LIST] });
      setOpen(false);
      toast({
        title: "Thành công",
        description: "Đã thêm contact mới",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm contact",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CONTACTS.LIST] });
      toast({
        title: "Thành công",
        description: "Đã xóa contact",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa contact",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertContact) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Danh bạ nhân sự tham gia trực ca và vận hành
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-contact">
              <Plus className="h-4 w-4 mr-2" />
              Thêm contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm contact mới</DialogTitle>
            </DialogHeader>
            <ContactForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Chưa có contact nào. Nhấn "Thêm contact" để bắt đầu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 border rounded-md space-y-2 hover-elevate"
                  data-testid={`contact-card-${contact.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{contact.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{contact.role}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(contact.id)}
                        data-testid={`button-delete-contact-${contact.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>
                  {contact.unit && (
                    <div className="text-xs text-muted-foreground">
                      Đơn vị: {contact.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa contact này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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
