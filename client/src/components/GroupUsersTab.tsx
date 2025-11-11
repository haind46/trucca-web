import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ExternalLink } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  mobilePhone: string;
  status: number;
}

interface UserGroupMapping {
  id: number;
  userId: string;
  user: User;
  groupId: number;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    content: UserGroupMapping[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  message: string;
  statusCode: number;
}

interface GroupUsersTabProps {
  groupId: number;
  groupName: string;
}

export function GroupUsersTab({ groupId, groupName }: GroupUsersTabProps) {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["group-users", groupId, page, limit],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/user-groups/group/${groupId}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group users");
      }

      return response.json();
    },
    enabled: !!groupId,
  });

  const users = data?.data.content || [];
  const totalElements = data?.data.totalElements || 0;
  const totalPages = data?.data.totalPages || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách người dùng trong nhóm: {groupName}
          </h3>
          <p className="text-sm text-gray-500">
            Tổng số: {totalElements} người dùng
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation("/admin/users")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Đi tới Quản lý người dùng
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có người dùng nào trong nhóm này
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã user</TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày thêm vào nhóm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-mono text-xs">
                      {mapping.user.id}
                    </TableCell>
                    <TableCell>{mapping.user.username}</TableCell>
                    <TableCell className="font-medium">
                      {mapping.user.fullname}
                    </TableCell>
                    <TableCell>{mapping.user.email}</TableCell>
                    <TableCell>{mapping.user.mobilePhone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={mapping.user.status === 1 ? "default" : "secondary"}
                      >
                        {mapping.user.status === 1 ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/admin/users`)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
