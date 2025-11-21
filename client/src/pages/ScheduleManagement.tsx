import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  Calendar,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Search,
  Copy,
  Upload,
  Download,
  FileDown,
  Users,
  CalendarDays,
  UserCheck,
} from "lucide-react";

// Types
interface Shift {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Schedule {
  id: number;
  fromDate: string;
  toDate: string | null;
  shiftId: number;
  shift: Shift;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: number;
  fullName: string;
  departmentId: number;
  email: string;
  phone: string;
  isActive: boolean;
}

interface ScheduleAssignment {
  id: number;
  scheduleId: number;
  schedule: Schedule;
  contactId: number;
  contact: Contact;
  role: string;
  status: string;
  createdAt: string;
}

interface ShiftFormData {
  shiftName: string;
  startTime: string;
  endTime: string;
  description: string;
  isActive: boolean;
}

interface ScheduleFormData {
  fromDate: string;
  toDate: string;
  shiftId: number | null;
  status: string;
  note: string;
}

interface AssignmentFormData {
  scheduleId: number | null;
  contactIds: number[];
  role: string;
  status: string;
}

// Status configurations
const scheduleStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Chờ xác nhận", variant: "secondary" },
  active: { label: "Đang hoạt động", variant: "default" },
  completed: { label: "Đã hoàn thành", variant: "outline" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
  updated: { label: "Đã cập nhật", variant: "secondary" },
};

const assignmentStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  assigned: { label: "Đã phân công", variant: "secondary" },
  checked_in: { label: "Đã checkin", variant: "default" },
  checked_out: { label: "Đã checkout", variant: "outline" },
  absent: { label: "Vắng mặt", variant: "destructive" },
  replaced: { label: "Đã thay thế", variant: "secondary" },
};

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  primary: { label: "Trực chính", variant: "default" },
  backup: { label: "Dự phòng", variant: "secondary" },
  viewer: { label: "Giám sát", variant: "outline" },
};

export default function ScheduleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Tab state
  const [activeTab, setActiveTab] = useState("shifts");

  // Shifts state
  const [shiftPage, setShiftPage] = useState(1);
  const [shiftKeyword, setShiftKeyword] = useState("");
  const [shiftSearchInput, setShiftSearchInput] = useState("");
  const [selectedShifts, setSelectedShifts] = useState<Set<number>>(new Set());
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deleteShiftId, setDeleteShiftId] = useState<number | null>(null);
  const [shiftFormData, setShiftFormData] = useState<ShiftFormData>({
    shiftName: "",
    startTime: "",
    endTime: "",
    description: "",
    isActive: true,
  });
  const shiftFileInputRef = useRef<HTMLInputElement>(null);

  // Schedule state
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleKeyword, setScheduleKeyword] = useState("");
  const [scheduleSearchInput, setScheduleSearchInput] = useState("");
  const [selectedSchedules, setSelectedSchedules] = useState<Set<number>>(new Set());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);
  const [scheduleFormData, setScheduleFormData] = useState<ScheduleFormData>({
    fromDate: "",
    toDate: "",
    shiftId: null,
    status: "pending",
    note: "",
  });
  const scheduleFileInputRef = useRef<HTMLInputElement>(null);

  // Assignment state
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentKeyword, setAssignmentKeyword] = useState("");
  const [assignmentSearchInput, setAssignmentSearchInput] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(new Set());
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ScheduleAssignment | null>(null);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<number | null>(null);
  const [assignmentFormData, setAssignmentFormData] = useState<AssignmentFormData>({
    scheduleId: null,
    contactIds: [],
    role: "primary",
    status: "assigned",
  });
  const [contactFilter, setContactFilter] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("");
  const assignmentFileInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  // ==================== SHIFTS QUERIES & MUTATIONS ====================

  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ["shifts", shiftPage, shiftKeyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: shiftPage.toString(),
        limit: limit.toString(),
        ...(shiftKeyword && { keyword: shiftKeyword }),
      });
      const response = await fetchWithAuth(`${API_ENDPOINTS.SHIFTS.LIST}?${params}`);
      return response.json();
    },
  });

  const shifts = shiftsData?.data?.data || [];
  const shiftTotal = shiftsData?.data?.total || 0;
  const shiftTotalPages = Math.ceil(shiftTotal / limit);

  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      const response = await fetchWithAuth(API_ENDPOINTS.SHIFTS.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create shift");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setShiftDialogOpen(false);
      resetShiftForm();
      toast({ title: "Thành công", description: "Đã thêm ca trực mới" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ShiftFormData }) => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SHIFTS.UPDATE}?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update shift");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setShiftDialogOpen(false);
      resetShiftForm();
      toast({ title: "Thành công", description: "Đã cập nhật ca trực" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(API_ENDPOINTS.SHIFTS.DELETE(id), {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete shift");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setDeleteShiftId(null);
      toast({ title: "Thành công", description: "Đã xóa ca trực" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const bulkDeleteShiftsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SHIFTS.DELETE_MANY}?ids=${ids.join(",")}`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete shifts");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setSelectedShifts(new Set());
      toast({ title: "Thành công", description: "Đã xóa các ca trực đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // ==================== SCHEDULE QUERIES & MUTATIONS ====================

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ["schedules", schedulePage, scheduleKeyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: schedulePage.toString(),
        limit: limit.toString(),
        ...(scheduleKeyword && { keyword: scheduleKeyword }),
      });
      const response = await fetchWithAuth(`${API_ENDPOINTS.SCHEDULE.LIST}?${params}`);
      return response.json();
    },
  });

  const schedules = schedulesData?.data?.data || [];
  const scheduleTotal = schedulesData?.data?.total || 0;
  const scheduleTotalPages = Math.ceil(scheduleTotal / limit);

  // Get all shifts for dropdown
  const { data: allShiftsData } = useQuery({
    queryKey: ["all-shifts"],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SHIFTS.FILTER}?limit=1000&isActive=true`);
      return response.json();
    },
  });
  const allShifts = allShiftsData?.data?.data || [];

  const createScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          toDate: data.toDate || null,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create schedule");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setScheduleDialogOpen(false);
      resetScheduleForm();
      toast({ title: "Thành công", description: "Đã thêm lịch trực mới" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ScheduleFormData }) => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SCHEDULE.UPDATE}?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          toDate: data.toDate || null,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update schedule");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setScheduleDialogOpen(false);
      resetScheduleForm();
      toast({ title: "Thành công", description: "Đã cập nhật lịch trực" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE.DELETE(id), {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete schedule");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setDeleteScheduleId(null);
      toast({ title: "Thành công", description: "Đã xóa lịch trực" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const bulkDeleteSchedulesMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SCHEDULE.DELETE_MANY}?ids=${ids.join(",")}`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete schedules");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setSelectedSchedules(new Set());
      toast({ title: "Thành công", description: "Đã xóa các lịch trực đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // ==================== ASSIGNMENT QUERIES & MUTATIONS ====================

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments", assignmentPage, assignmentKeyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: assignmentPage.toString(),
        limit: limit.toString(),
        ...(assignmentKeyword && { keyword: assignmentKeyword }),
      });
      const response = await fetchWithAuth(`${API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.LIST}?${params}`);
      return response.json();
    },
  });

  const assignments = assignmentsData?.data?.data || [];
  const assignmentTotal = assignmentsData?.data?.total || 0;
  const assignmentTotalPages = Math.ceil(assignmentTotal / limit);

  // Get all schedules for dropdown
  const { data: allSchedulesData } = useQuery({
    queryKey: ["all-schedules"],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SCHEDULE.LIST}?limit=1000`);
      return response.json();
    },
  });
  const allSchedules = allSchedulesData?.data?.data || [];

  // Get all contacts for dropdown
  const { data: allContactsData } = useQuery({
    queryKey: ["all-contacts-for-assignment"],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.CONTACTS.LIST}?page=1&limit=1000`);
      return response.json();
    },
  });
  const allContacts = allContactsData?.data?.data || [];

  // Filter contacts client-side
  const filteredContacts = allContacts.filter((contact: Contact) => {
    if (!contactFilter) return true;
    const searchLower = contactFilter.toLowerCase();
    return (
      contact.fullName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.phone.includes(contactFilter)
    );
  });

  // Filter schedules client-side
  const filteredSchedules = allSchedules.filter((schedule: Schedule) => {
    if (!scheduleFilter) return true;
    const searchLower = scheduleFilter.toLowerCase();
    return (
      schedule.fromDate.includes(scheduleFilter) ||
      (schedule.toDate && schedule.toDate.includes(scheduleFilter)) ||
      schedule.shift?.shiftName.toLowerCase().includes(searchLower) ||
      (schedule.note && schedule.note.toLowerCase().includes(searchLower))
    );
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create assignment");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setAssignmentDialogOpen(false);
      resetAssignmentForm();
      toast({ title: "Thành công", description: "Đã thêm phân công mới" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AssignmentFormData }) => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.UPDATE}?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update assignment");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setAssignmentDialogOpen(false);
      resetAssignmentForm();
      toast({ title: "Thành công", description: "Đã cập nhật phân công" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.DELETE(id), {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete assignment");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setDeleteAssignmentId(null);
      toast({ title: "Thành công", description: "Đã xóa phân công" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const bulkDeleteAssignmentsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.DELETE_MANY}?ids=${ids.join(",")}`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete assignments");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setSelectedAssignments(new Set());
      toast({ title: "Thành công", description: "Đã xóa các phân công đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // ==================== HELPER FUNCTIONS ====================

  const resetShiftForm = () => {
    setShiftFormData({
      shiftName: "",
      startTime: "",
      endTime: "",
      description: "",
      isActive: true,
    });
    setEditingShift(null);
  };

  const resetScheduleForm = () => {
    setScheduleFormData({
      fromDate: "",
      toDate: "",
      shiftId: null,
      status: "pending",
      note: "",
    });
    setEditingSchedule(null);
  };

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      scheduleId: null,
      contactIds: [],
      role: "primary",
      status: "assigned",
    });
    setEditingAssignment(null);
    setContactFilter("");
    setScheduleFilter("");
  };

  // ==================== SHIFT HANDLERS ====================

  const handleShiftSearch = () => {
    setShiftKeyword(shiftSearchInput);
    setShiftPage(1);
  };

  const handleCreateShift = () => {
    resetShiftForm();
    setShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftFormData({
      shiftName: shift.shiftName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description || "",
      isActive: shift.isActive,
    });
    setShiftDialogOpen(true);
  };

  const handleCopyShift = (shift: Shift) => {
    setEditingShift(null);
    setShiftFormData({
      shiftName: shift.shiftName + " (Copy)",
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description || "",
      isActive: shift.isActive,
    });
    setShiftDialogOpen(true);
  };

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift) {
      updateShiftMutation.mutate({ id: editingShift.id, data: shiftFormData });
    } else {
      createShiftMutation.mutate(shiftFormData);
    }
  };

  const handleShiftSelectAll = () => {
    if (selectedShifts.size === shifts.length) {
      setSelectedShifts(new Set());
    } else {
      setSelectedShifts(new Set(shifts.map((s: Shift) => s.id)));
    }
  };

  const handleShiftSelect = (id: number) => {
    const newSelected = new Set(selectedShifts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedShifts(newSelected);
  };

  const handleShiftBulkDelete = () => {
    bulkDeleteShiftsMutation.mutate(Array.from(selectedShifts));
  };

  const handleShiftExport = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SHIFTS.EXPORT);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shifts_export.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Lỗi", description: "Không thể export dữ liệu", variant: "destructive" });
    }
  };

  const handleShiftTemplate = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SHIFTS.TEMPLATE);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shifts_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải file mẫu", variant: "destructive" });
    }
  };

  const handleShiftImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SHIFTS.IMPORT, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["shifts"] });
        toast({ title: "Thành công", description: "Đã import dữ liệu" });
      } else {
        toast({ title: "Lỗi", description: result.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể import dữ liệu", variant: "destructive" });
    }
    e.target.value = "";
  };

  // ==================== SCHEDULE HANDLERS ====================

  const handleScheduleSearch = () => {
    setScheduleKeyword(scheduleSearchInput);
    setSchedulePage(1);
  };

  const handleCreateSchedule = () => {
    resetScheduleForm();
    setScheduleDialogOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setScheduleFormData({
      fromDate: schedule.fromDate,
      toDate: schedule.toDate || "",
      shiftId: schedule.shiftId,
      status: schedule.status,
      note: schedule.note || "",
    });
    setScheduleDialogOpen(true);
  };

  const handleCopySchedule = (schedule: Schedule) => {
    setEditingSchedule(null);
    setScheduleFormData({
      fromDate: schedule.fromDate,
      toDate: schedule.toDate || "",
      shiftId: schedule.shiftId,
      status: "pending",
      note: schedule.note ? schedule.note + " (Copy)" : "",
    });
    setScheduleDialogOpen(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      updateScheduleMutation.mutate({ id: editingSchedule.id, data: scheduleFormData });
    } else {
      createScheduleMutation.mutate(scheduleFormData);
    }
  };

  const handleScheduleSelectAll = () => {
    if (selectedSchedules.size === schedules.length) {
      setSelectedSchedules(new Set());
    } else {
      setSelectedSchedules(new Set(schedules.map((s: Schedule) => s.id)));
    }
  };

  const handleScheduleSelect = (id: number) => {
    const newSelected = new Set(selectedSchedules);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSchedules(newSelected);
  };

  const handleScheduleBulkDelete = () => {
    bulkDeleteSchedulesMutation.mutate(Array.from(selectedSchedules));
  };

  const handleScheduleExport = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE.EXPORT);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedules_export.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Lỗi", description: "Không thể export dữ liệu", variant: "destructive" });
    }
  };

  const handleScheduleTemplate = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE.TEMPLATE);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedules_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải file mẫu", variant: "destructive" });
    }
  };

  const handleScheduleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE.IMPORT, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        toast({ title: "Thành công", description: "Đã import dữ liệu" });
      } else {
        toast({ title: "Lỗi", description: result.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể import dữ liệu", variant: "destructive" });
    }
    e.target.value = "";
  };

  // ==================== ASSIGNMENT HANDLERS ====================

  const handleAssignmentSearch = () => {
    setAssignmentKeyword(assignmentSearchInput);
    setAssignmentPage(1);
  };

  const handleCreateAssignment = () => {
    resetAssignmentForm();
    setAssignmentDialogOpen(true);
  };

  const handleEditAssignment = (assignment: ScheduleAssignment) => {
    setEditingAssignment(assignment);
    setAssignmentFormData({
      scheduleId: assignment.scheduleId,
      contactIds: [assignment.contactId],
      role: assignment.role,
      status: assignment.status,
    });
    setAssignmentDialogOpen(true);
  };

  const handleCopyAssignment = (assignment: ScheduleAssignment) => {
    setEditingAssignment(null);
    setAssignmentFormData({
      scheduleId: assignment.scheduleId,
      contactIds: [],
      role: assignment.role,
      status: "assigned",
    });
    setAssignmentDialogOpen(true);
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!assignmentFormData.scheduleId) {
      toast({ title: "Lỗi", description: "Vui lòng chọn lịch trực", variant: "destructive" });
      return;
    }
    if (assignmentFormData.contactIds.length === 0) {
      toast({ title: "Lỗi", description: "Vui lòng chọn ít nhất một người trực", variant: "destructive" });
      return;
    }

    if (editingAssignment) {
      // Khi edit chỉ update 1 assignment
      updateAssignmentMutation.mutate({
        id: editingAssignment.id,
        data: {
          ...assignmentFormData,
          contactId: assignmentFormData.contactIds[0]
        }
      });
    } else {
      // Tạo nhiều assignments cho mỗi contact được chọn
      assignmentFormData.contactIds.forEach((contactId) => {
        createAssignmentMutation.mutate({
          ...assignmentFormData,
          contactId,
        } as any);
      });
    }
  };

  const handleAssignmentSelectAll = () => {
    if (selectedAssignments.size === assignments.length) {
      setSelectedAssignments(new Set());
    } else {
      setSelectedAssignments(new Set(assignments.map((a: ScheduleAssignment) => a.id)));
    }
  };

  const handleAssignmentSelect = (id: number) => {
    const newSelected = new Set(selectedAssignments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAssignments(newSelected);
  };

  const handleAssignmentBulkDelete = () => {
    bulkDeleteAssignmentsMutation.mutate(Array.from(selectedAssignments));
  };

  const handleAssignmentExport = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.EXPORT);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedule_assignments_export.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Lỗi", description: "Không thể export dữ liệu", variant: "destructive" });
    }
  };

  const handleAssignmentTemplate = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.TEMPLATE);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedule_assignments_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải file mẫu", variant: "destructive" });
    }
  };

  const handleAssignmentImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_ASSIGNMENTS.IMPORT, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        toast({ title: "Thành công", description: "Đã import dữ liệu" });
      } else {
        toast({ title: "Lỗi", description: result.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể import dữ liệu", variant: "destructive" });
    }
    e.target.value = "";
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderToolbar = (
    searchInput: string,
    setSearchInput: (value: string) => void,
    handleSearch: () => void,
    selectedItems: Set<number>,
    handleBulkDelete: () => void,
    handleTemplate: () => void,
    handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleExport: () => void,
    handleCreate: () => void,
    fileInputRef: React.RefObject<HTMLInputElement>,
    placeholder: string
  ) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Input
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {selectedItems.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa nhiều ({selectedItems.size})
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleTemplate}>
          <FileDown className="h-4 w-4 mr-2" />
          File mẫu
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          className="hidden"
          onChange={handleImport}
        />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm mới
        </Button>
      </div>
    </div>
  );

  const renderPagination = (
    page: number,
    setPage: (page: number) => void,
    totalPages: number,
    total: number
  ) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} trong tổng số {total}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Trước
          </Button>
          <div className="text-sm">
            Trang {page} / {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            Sau
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quản lý Lịch trực Ca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="shifts" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ca trực
              </TabsTrigger>
              <TabsTrigger value="schedules" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Lịch trực
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Phân công
              </TabsTrigger>
            </TabsList>

            {/* SHIFTS TAB */}
            <TabsContent value="shifts">
              {renderToolbar(
                shiftSearchInput,
                setShiftSearchInput,
                handleShiftSearch,
                selectedShifts,
                handleShiftBulkDelete,
                handleShiftTemplate,
                handleShiftImport,
                handleShiftExport,
                handleCreateShift,
                shiftFileInputRef,
                "Tìm kiếm theo tên ca, mô tả..."
              )}

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={shifts.length > 0 && selectedShifts.size === shifts.length}
                          onCheckedChange={handleShiftSelectAll}
                        />
                      </TableHead>
                      <TableHead>Tên ca</TableHead>
                      <TableHead>Giờ bắt đầu</TableHead>
                      <TableHead>Giờ kết thúc</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shiftsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : shifts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          {shiftKeyword
                            ? "Không tìm thấy kết quả phù hợp"
                            : 'Chưa có ca trực nào. Nhấn "Thêm mới" để bắt đầu.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      shifts.map((shift: Shift) => (
                        <TableRow key={shift.id}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedShifts.has(shift.id)}
                              onCheckedChange={() => handleShiftSelect(shift.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{shift.shiftName}</TableCell>
                          <TableCell>{shift.startTime}</TableCell>
                          <TableCell>{shift.endTime}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {shift.description || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={shift.isActive ? "default" : "secondary"}>
                              {shift.isActive ? "Hoạt động" : "Tạm ngưng"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleCopyShift(shift)} title="Sao chép">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditShift(shift)} title="Chỉnh sửa">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteShiftId(shift.id)} title="Xóa">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {renderPagination(shiftPage, setShiftPage, shiftTotalPages, shiftTotal)}
            </TabsContent>

            {/* SCHEDULES TAB */}
            <TabsContent value="schedules">
              {renderToolbar(
                scheduleSearchInput,
                setScheduleSearchInput,
                handleScheduleSearch,
                selectedSchedules,
                handleScheduleBulkDelete,
                handleScheduleTemplate,
                handleScheduleImport,
                handleScheduleExport,
                handleCreateSchedule,
                scheduleFileInputRef,
                "Tìm kiếm theo trạng thái, ghi chú..."
              )}

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={schedules.length > 0 && selectedSchedules.size === schedules.length}
                          onCheckedChange={handleScheduleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Từ ngày</TableHead>
                      <TableHead>Đến ngày</TableHead>
                      <TableHead>Ca trực</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedulesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : schedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          {scheduleKeyword
                            ? "Không tìm thấy kết quả phù hợp"
                            : 'Chưa có lịch trực nào. Nhấn "Thêm mới" để bắt đầu.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      schedules.map((schedule: Schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedSchedules.has(schedule.id)}
                              onCheckedChange={() => handleScheduleSelect(schedule.id)}
                            />
                          </TableCell>
                          <TableCell>{schedule.fromDate}</TableCell>
                          <TableCell>{schedule.toDate || "-"}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{schedule.shift?.shiftName}</div>
                              <div className="text-muted-foreground">
                                {schedule.shift?.startTime} - {schedule.shift?.endTime}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={scheduleStatusConfig[schedule.status]?.variant || "secondary"}>
                              {scheduleStatusConfig[schedule.status]?.label || schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {schedule.note || "-"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleCopySchedule(schedule)} title="Sao chép">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditSchedule(schedule)} title="Chỉnh sửa">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteScheduleId(schedule.id)} title="Xóa">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {renderPagination(schedulePage, setSchedulePage, scheduleTotalPages, scheduleTotal)}
            </TabsContent>

            {/* ASSIGNMENTS TAB */}
            <TabsContent value="assignments">
              {renderToolbar(
                assignmentSearchInput,
                setAssignmentSearchInput,
                handleAssignmentSearch,
                selectedAssignments,
                handleAssignmentBulkDelete,
                handleAssignmentTemplate,
                handleAssignmentImport,
                handleAssignmentExport,
                handleCreateAssignment,
                assignmentFileInputRef,
                "Tìm kiếm theo vai trò, trạng thái..."
              )}

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={assignments.length > 0 && selectedAssignments.size === assignments.length}
                          onCheckedChange={handleAssignmentSelectAll}
                        />
                      </TableHead>
                      <TableHead>Lịch trực</TableHead>
                      <TableHead>Người trực</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          {assignmentKeyword
                            ? "Không tìm thấy kết quả phù hợp"
                            : 'Chưa có phân công nào. Nhấn "Thêm mới" để bắt đầu.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment: ScheduleAssignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedAssignments.has(assignment.id)}
                              onCheckedChange={() => handleAssignmentSelect(assignment.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {assignment.schedule?.fromDate}
                                {assignment.schedule?.toDate && ` - ${assignment.schedule.toDate}`}
                              </div>
                              <div className="text-muted-foreground">
                                {assignment.schedule?.shift?.shiftName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{assignment.contact?.fullName}</div>
                              <div className="text-muted-foreground">{assignment.contact?.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={roleConfig[assignment.role]?.variant || "secondary"}>
                              {roleConfig[assignment.role]?.label || assignment.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignmentStatusConfig[assignment.status]?.variant || "secondary"}>
                              {assignmentStatusConfig[assignment.status]?.label || assignment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleCopyAssignment(assignment)} title="Sao chép">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditAssignment(assignment)} title="Chỉnh sửa">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteAssignmentId(assignment.id)} title="Xóa">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {renderPagination(assignmentPage, setAssignmentPage, assignmentTotalPages, assignmentTotal)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* SHIFT DIALOG */}
      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingShift ? "Chỉnh sửa ca trực" : "Thêm ca trực mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleShiftSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Tên ca <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={shiftFormData.shiftName}
                    onChange={(e) => setShiftFormData({ ...shiftFormData, shiftName: e.target.value })}
                    placeholder="VD: Ca Ngày"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Giờ bắt đầu <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={shiftFormData.startTime}
                    onChange={(e) => setShiftFormData({ ...shiftFormData, startTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Giờ kết thúc <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={shiftFormData.endTime}
                    onChange={(e) => setShiftFormData({ ...shiftFormData, endTime: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="shiftActive"
                    checked={shiftFormData.isActive}
                    onCheckedChange={(checked) => setShiftFormData({ ...shiftFormData, isActive: checked })}
                  />
                  <Label htmlFor="shiftActive">Kích hoạt</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={shiftFormData.description}
                  onChange={(e) => setShiftFormData({ ...shiftFormData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về ca trực"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShiftDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createShiftMutation.isPending || updateShiftMutation.isPending}>
                {editingShift ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SCHEDULE DIALOG */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Chỉnh sửa lịch trực" : "Thêm lịch trực mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Từ ngày <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={scheduleFormData.fromDate}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, fromDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Đến ngày</Label>
                  <Input
                    type="date"
                    value={scheduleFormData.toDate}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, toDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Ca trực <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={scheduleFormData.shiftId?.toString() || ""}
                    onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, shiftId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca trực" />
                    </SelectTrigger>
                    <SelectContent>
                      {allShifts.map((shift: Shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.shiftName} ({shift.startTime} - {shift.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={scheduleFormData.status}
                    onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                      <SelectItem value="updated">Đã cập nhật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  value={scheduleFormData.note}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, note: e.target.value })}
                  placeholder="Ghi chú về lịch trực"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}>
                {editingSchedule ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ASSIGNMENT DIALOG */}
      <Dialog open={assignmentDialogOpen} onOpenChange={(open) => {
        setAssignmentDialogOpen(open);
        if (!open) {
          setContactFilter("");
          setScheduleFilter("");
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? "Chỉnh sửa phân công" : "Thêm phân công mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignmentSubmit}>
            <div className="space-y-4 py-4">
              {/* Lịch trực - Select dropdown */}
              <div className="space-y-2">
                <Label>
                  Lịch trực <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm lịch trực..."
                      value={scheduleFilter}
                      onChange={(e) => setScheduleFilter(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={assignmentFormData.scheduleId?.toString() || ""}
                    onValueChange={(value) => setAssignmentFormData({ ...assignmentFormData, scheduleId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lịch trực" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSchedules.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Không tìm thấy lịch trực
                        </div>
                      ) : (
                        filteredSchedules.map((schedule: Schedule) => (
                          <SelectItem key={schedule.id} value={schedule.id.toString()}>
                            {schedule.fromDate} {schedule.toDate ? `- ${schedule.toDate}` : ""} ({schedule.shift?.shiftName})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Người trực - Table với ScrollArea */}
              <div className="space-y-2">
                <Label>
                  Người trực <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên, email, điện thoại, đơn vị..."
                    value={contactFilter}
                    onChange={(e) => setContactFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-[200px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          {!editingAssignment && (
                            <Checkbox
                              checked={filteredContacts.length > 0 && assignmentFormData.contactIds.length === filteredContacts.length}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAssignmentFormData({
                                    ...assignmentFormData,
                                    contactIds: filteredContacts.map((c: Contact) => c.id)
                                  });
                                } else {
                                  setAssignmentFormData({ ...assignmentFormData, contactIds: [] });
                                }
                              }}
                            />
                          )}
                        </TableHead>
                        <TableHead>Họ và tên</TableHead>
                        <TableHead>Đơn vị</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Điện thoại</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Không tìm thấy người trực
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredContacts.map((contact: Contact) => {
                          const isSelected = assignmentFormData.contactIds.includes(contact.id);
                          const handleToggle = () => {
                            if (editingAssignment) {
                              // Khi edit chỉ cho chọn 1 người
                              setAssignmentFormData(prev => ({
                                ...prev,
                                contactIds: isSelected ? [] : [contact.id]
                              }));
                            } else {
                              // Khi thêm mới cho chọn nhiều người
                              setAssignmentFormData(prev => ({
                                ...prev,
                                contactIds: isSelected
                                  ? prev.contactIds.filter(id => id !== contact.id)
                                  : [...prev.contactIds, contact.id]
                              }));
                            }
                          };

                          return (
                            <TableRow
                              key={contact.id}
                              className={`cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
                              onClick={handleToggle}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={handleToggle}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{contact.fullName}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {contact.department?.name || "-"}
                              </TableCell>
                              <TableCell className="text-sm">{contact.email}</TableCell>
                              <TableCell className="text-sm">{contact.phone}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Vai trò và Trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Select
                    value={assignmentFormData.role}
                    onValueChange={(value) => setAssignmentFormData({ ...assignmentFormData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Trực chính</SelectItem>
                      <SelectItem value="backup">Dự phòng</SelectItem>
                      <SelectItem value="viewer">Giám sát</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={assignmentFormData.status}
                    onValueChange={(value) => setAssignmentFormData({ ...assignmentFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Đã phân công</SelectItem>
                      <SelectItem value="checked_in">Đã checkin</SelectItem>
                      <SelectItem value="checked_out">Đã checkout</SelectItem>
                      <SelectItem value="absent">Vắng mặt</SelectItem>
                      <SelectItem value="replaced">Đã thay thế</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}>
                {editingAssignment ? "Cập nhật" : `Thêm mới${assignmentFormData.contactIds.length > 0 ? ` (${assignmentFormData.contactIds.length})` : ''}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE SHIFT DIALOG */}
      <AlertDialog open={deleteShiftId !== null} onOpenChange={() => setDeleteShiftId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ca trực này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteShiftId && deleteShiftMutation.mutate(deleteShiftId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE SCHEDULE DIALOG */}
      <AlertDialog open={deleteScheduleId !== null} onOpenChange={() => setDeleteScheduleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lịch trực này? Hành động này không thể hoàn tác và sẽ xóa các phân công liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteScheduleId && deleteScheduleMutation.mutate(deleteScheduleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE ASSIGNMENT DIALOG */}
      <AlertDialog open={deleteAssignmentId !== null} onOpenChange={() => setDeleteAssignmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phân công này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAssignmentId && deleteAssignmentMutation.mutate(deleteAssignmentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
