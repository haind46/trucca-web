/**
 * SystemCatalogContactManager
 * Component để quản lý liên hệ (Contacts và Group Contacts) cho System Catalog
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, X, Plus, Trash2, Search } from "lucide-react";
import { systemCatalogService } from "@/services/systemCatalogService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Contact, GroupContact, SystemCatalogContact, SystemCatalogGroupContact } from "@/types/system-catalog";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { fetchWithAuth } from "@/lib/api";

interface SystemCatalogContactManagerProps {
  systemCatalogId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SystemCatalogContactManager({
  systemCatalogId,
  isOpen,
  onClose,
}: SystemCatalogContactManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedContactIds, setSelectedContactIds] = useState<Set<number>>(new Set());
  const [selectedGroupContactIds, setSelectedGroupContactIds] = useState<Set<number>>(new Set());
  const [contactSearchKeyword, setContactSearchKeyword] = useState("");
  const [groupContactSearchKeyword, setGroupContactSearchKeyword] = useState("");

  // Fetch assigned contacts
  const { data: assignedContactsData, isLoading: loadingContacts, refetch: refetchAssignedContacts } = useQuery({
    queryKey: ["system-catalog-contacts", systemCatalogId],
    queryFn: async () => {
      const result = await systemCatalogService.getAssignedContacts(systemCatalogId);
      console.log("[DEBUG] Assigned contacts data:", result.data);
      return result.data || [];
    },
    enabled: isOpen && !!systemCatalogId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale
  });

  // Fetch assigned group contacts
  const { data: assignedGroupContactsData, isLoading: loadingGroupContacts, refetch: refetchAssignedGroupContacts } = useQuery({
    queryKey: ["system-catalog-group-contacts", systemCatalogId],
    queryFn: async () => {
      const result = await systemCatalogService.getAssignedGroupContacts(systemCatalogId);
      console.log("[DEBUG] Assigned group contacts data:", result.data);
      return result.data || [];
    },
    enabled: isOpen && !!systemCatalogId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale
  });

  // Fetch all available contacts
  const { data: allContactsData } = useQuery({
    queryKey: ["all-contacts"],
    queryFn: async () => {
      const url = `${API_ENDPOINTS.CONTACTS.LIST}?page=1&limit=1000`;
      console.log("[DEBUG] Fetching all contacts from:", url);
      const response = await fetchWithAuth(url);
      const result = await response.json();
      console.log("[DEBUG] All contacts result:", result);
      console.log("[DEBUG] All contacts data extracted:", result.data?.data);
      return result.data?.data || [];
    },
    enabled: isOpen,
    staleTime: 0,
  });

  // Fetch all available group contacts
  const { data: allGroupContactsData } = useQuery({
    queryKey: ["all-group-contacts"],
    queryFn: async () => {
      const url = `${API_ENDPOINTS.GROUP_CONTACTS.LIST}?page=1&limit=1000`;
      const response = await fetchWithAuth(url);
      const result = await response.json();
      return result.data?.data || [];
    },
    enabled: isOpen,
  });

  // Assign contacts mutation
  const assignContactsMutation = useMutation({
    mutationFn: async (contactIds: number[]) => {
      return systemCatalogService.assignContacts(systemCatalogId, contactIds);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["system-catalog-contacts", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["system-catalog-contacts-summary", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["all-contacts"] }),
        refetchAssignedContacts(),
      ]);
      setSelectedContactIds(new Set());
      toast({ title: "Thành công", description: "Đã gán liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Unassign contacts mutation
  const unassignContactsMutation = useMutation({
    mutationFn: async (contactIds: number[]) => {
      return systemCatalogService.unassignContacts(systemCatalogId, contactIds);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["system-catalog-contacts", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["system-catalog-contacts-summary", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["all-contacts"] }),
        refetchAssignedContacts(),
      ]);
      toast({ title: "Thành công", description: "Đã bỏ gán liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Assign group contacts mutation
  const assignGroupContactsMutation = useMutation({
    mutationFn: async (groupContactIds: number[]) => {
      return systemCatalogService.assignGroupContacts(systemCatalogId, groupContactIds);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["system-catalog-group-contacts", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["system-catalog-group-contacts-summary", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["all-group-contacts"] }),
        refetchAssignedGroupContacts(),
      ]);
      setSelectedGroupContactIds(new Set());
      toast({ title: "Thành công", description: "Đã gán nhóm liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Unassign group contacts mutation
  const unassignGroupContactsMutation = useMutation({
    mutationFn: async (groupContactIds: number[]) => {
      return systemCatalogService.unassignGroupContacts(systemCatalogId, groupContactIds);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["system-catalog-group-contacts", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["system-catalog-group-contacts-summary", systemCatalogId] }),
        queryClient.invalidateQueries({ queryKey: ["all-group-contacts"] }),
        refetchAssignedGroupContacts(),
      ]);
      toast({ title: "Thành công", description: "Đã bỏ gán nhóm liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  let assignedContacts = assignedContactsData || [];
  let assignedGroupContacts = assignedGroupContactsData || [];
  const allContacts = (allContactsData || []) as Contact[];
  const allGroupContacts = (allGroupContactsData || []) as GroupContact[];

  console.log("[DEBUG] assignedContacts (raw):", assignedContacts);
  console.log("[DEBUG] allContacts:", allContacts);

  // WORKAROUND: Merge contact data from allContacts when contact is null (backend bug)
  if (allContacts.length > 0) {
    const contactMap = new Map(allContacts.map(c => [c.id, c]));
    assignedContacts = assignedContacts.map((ac: SystemCatalogContact) => {
      if (!ac.contact && contactMap.has(ac.contactId)) {
        return { ...ac, contact: contactMap.get(ac.contactId) };
      }
      return ac;
    });
    console.log("[DEBUG] assignedContacts (merged):", assignedContacts);
  }

  // WORKAROUND: Merge groupContact data from allGroupContacts when groupContact is null
  if (allGroupContacts.length > 0) {
    const groupContactMap = new Map(allGroupContacts.map(gc => [gc.id, gc]));
    assignedGroupContacts = assignedGroupContacts.map((agc: SystemCatalogGroupContact) => {
      if (!agc.groupContact && groupContactMap.has(agc.groupContactId)) {
        return { ...agc, groupContact: groupContactMap.get(agc.groupContactId) };
      }
      return agc;
    });
  }

  // Get assigned contact IDs (filter out null contacts first)
  const assignedContactIds = new Set(
    assignedContacts
      .filter((ac: SystemCatalogContact) => ac.contact !== null && ac.contact !== undefined)
      .map((ac: SystemCatalogContact) => ac.contactId)
  );
  const assignedGroupContactIds = new Set(
    assignedGroupContacts
      .filter((agc: SystemCatalogGroupContact) => agc.groupContact !== null && agc.groupContact !== undefined)
      .map((agc: SystemCatalogGroupContact) => agc.groupContactId)
  );

  // Filter available (not yet assigned) contacts
  const availableContacts = allContacts.filter((c: Contact) => !assignedContactIds.has(c.id));
  const availableGroupContacts = allGroupContacts.filter((gc: GroupContact) => !assignedGroupContactIds.has(gc.id));

  // Apply search filter for contacts
  const filteredAssignedContacts = assignedContacts.filter((ac: SystemCatalogContact) => {
    // Skip records with null contact when searching
    if (!ac.contact) return false;

    if (!contactSearchKeyword) return true;
    const keyword = contactSearchKeyword.toLowerCase();
    return (
      ac.contact.fullName.toLowerCase().includes(keyword) ||
      (ac.contact.email && ac.contact.email.toLowerCase().includes(keyword)) ||
      (ac.contact.phone && ac.contact.phone.includes(keyword))
    );
  });

  // Count contacts with valid data
  const validAssignedContactsCount = assignedContacts.filter((ac: SystemCatalogContact) => ac.contact !== null && ac.contact !== undefined).length;

  const filteredAvailableContacts = availableContacts.filter((c: Contact) => {
    if (!contactSearchKeyword) return true;
    const keyword = contactSearchKeyword.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(keyword) ||
      (c.email && c.email.toLowerCase().includes(keyword)) ||
      (c.phone && c.phone.includes(keyword))
    );
  });

  // Apply search filter for group contacts
  const filteredAssignedGroupContacts = assignedGroupContacts.filter((agc: SystemCatalogGroupContact) => {
    // Skip records with null groupContact when searching
    if (!agc.groupContact) return false;

    if (!groupContactSearchKeyword) return true;
    const keyword = groupContactSearchKeyword.toLowerCase();
    return (
      agc.groupContact.name.toLowerCase().includes(keyword) ||
      (agc.groupContact.description && agc.groupContact.description.toLowerCase().includes(keyword))
    );
  });

  // Count group contacts with valid data
  const validAssignedGroupContactsCount = assignedGroupContacts.filter((agc: SystemCatalogGroupContact) => agc.groupContact !== null && agc.groupContact !== undefined).length;

  const filteredAvailableGroupContacts = availableGroupContacts.filter((gc: GroupContact) => {
    if (!groupContactSearchKeyword) return true;
    const keyword = groupContactSearchKeyword.toLowerCase();
    return (
      gc.name.toLowerCase().includes(keyword) ||
      (gc.description && gc.description.toLowerCase().includes(keyword))
    );
  });

  const handleAssignContacts = () => {
    if (selectedContactIds.size === 0) {
      toast({ title: "Thông báo", description: "Vui lòng chọn ít nhất một liên hệ" });
      return;
    }
    assignContactsMutation.mutate(Array.from(selectedContactIds));
  };

  const handleUnassignContacts = (contactIds: number[]) => {
    unassignContactsMutation.mutate(contactIds);
  };

  const handleAssignGroupContacts = () => {
    if (selectedGroupContactIds.size === 0) {
      toast({ title: "Thông báo", description: "Vui lòng chọn ít nhất một nhóm liên hệ" });
      return;
    }
    assignGroupContactsMutation.mutate(Array.from(selectedGroupContactIds));
  };

  const handleUnassignGroupContacts = (groupContactIds: number[]) => {
    unassignGroupContactsMutation.mutate(groupContactIds);
  };

  const toggleContactSelection = (contactId: number) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(contactId)) {
      newSet.delete(contactId);
    } else {
      newSet.add(contactId);
    }
    setSelectedContactIds(newSet);
  };

  const toggleGroupContactSelection = (groupContactId: number) => {
    const newSet = new Set(selectedGroupContactIds);
    if (newSet.has(groupContactId)) {
      newSet.delete(groupContactId);
    } else {
      newSet.add(groupContactId);
    }
    setSelectedGroupContactIds(newSet);
  };

  // Reset selections and search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedContactIds(new Set());
      setSelectedGroupContactIds(new Set());
      setContactSearchKeyword("");
      setGroupContactSearchKeyword("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý Liên hệ
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="contacts" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts">
              Liên hệ ({assignedContacts.length})
            </TabsTrigger>
            <TabsTrigger value="group-contacts">
              Nhóm liên hệ ({assignedGroupContacts.length})
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="flex-1 overflow-auto space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={contactSearchKeyword}
                onChange={(e) => setContactSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Assigned Contacts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Đã gán ({filteredAssignedContacts.length}/{validAssignedContactsCount})</h3>
              </div>
              {loadingContacts ? (
                <div className="text-center text-sm text-muted-foreground py-4">Đang tải...</div>
              ) : filteredAssignedContacts.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {validAssignedContactsCount === 0 ? "Chưa có liên hệ nào được gán" : "Không tìm thấy kết quả"}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Điện thoại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignedContacts.map((ac: SystemCatalogContact) => (
                        <TableRow key={ac.id}>
                          <TableCell className="font-medium">{ac.contact.fullName}</TableCell>
                          <TableCell>{ac.contact.email || "-"}</TableCell>
                          <TableCell>{ac.contact.phone || "-"}</TableCell>
                          <TableCell>
                            {ac.contact.isActive ? (
                              <Badge>Hoạt động</Badge>
                            ) : (
                              <Badge variant="secondary">Không hoạt động</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnassignContacts([ac.contactId])}
                              title="Bỏ gán"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Available Contacts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Có thể gán ({filteredAvailableContacts.length}/{availableContacts.length})</h3>
                {selectedContactIds.size > 0 && (
                  <Button
                    size="sm"
                    onClick={handleAssignContacts}
                    disabled={assignContactsMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Gán đã chọn ({selectedContactIds.size})
                  </Button>
                )}
              </div>
              {filteredAvailableContacts.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {availableContacts.length === 0 ? "Không còn liên hệ nào để gán" : "Không tìm thấy kết quả"}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedContactIds.size === filteredAvailableContacts.length && filteredAvailableContacts.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContactIds(new Set(filteredAvailableContacts.map((c: Contact) => c.id)));
                              } else {
                                setSelectedContactIds(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Điện thoại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAvailableContacts.map((contact: Contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedContactIds.has(contact.id)}
                              onCheckedChange={() => toggleContactSelection(contact.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{contact.fullName}</TableCell>
                          <TableCell>{contact.email || "-"}</TableCell>
                          <TableCell>{contact.phone || "-"}</TableCell>
                          <TableCell>
                            {contact.isActive ? (
                              <Badge>Hoạt động</Badge>
                            ) : (
                              <Badge variant="secondary">Không hoạt động</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Group Contacts Tab */}
          <TabsContent value="group-contacts" className="flex-1 overflow-auto space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên nhóm, mô tả..."
                value={groupContactSearchKeyword}
                onChange={(e) => setGroupContactSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Assigned Group Contacts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Đã gán ({filteredAssignedGroupContacts.length}/{validAssignedGroupContactsCount})</h3>
              </div>
              {loadingGroupContacts ? (
                <div className="text-center text-sm text-muted-foreground py-4">Đang tải...</div>
              ) : filteredAssignedGroupContacts.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {validAssignedGroupContactsCount === 0 ? "Chưa có nhóm liên hệ nào được gán" : "Không tìm thấy kết quả"}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên nhóm</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignedGroupContacts.map((agc: SystemCatalogGroupContact) => (
                        <TableRow key={agc.id}>
                          <TableCell className="font-medium">{agc.groupContact.name}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {agc.groupContact.description || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {agc.groupContact.isActive ? (
                              <Badge>Hoạt động</Badge>
                            ) : (
                              <Badge variant="secondary">Không hoạt động</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnassignGroupContacts([agc.groupContactId])}
                              title="Bỏ gán"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Available Group Contacts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Có thể gán ({filteredAvailableGroupContacts.length}/{availableGroupContacts.length})</h3>
                {selectedGroupContactIds.size > 0 && (
                  <Button
                    size="sm"
                    onClick={handleAssignGroupContacts}
                    disabled={assignGroupContactsMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Gán đã chọn ({selectedGroupContactIds.size})
                  </Button>
                )}
              </div>
              {filteredAvailableGroupContacts.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {availableGroupContacts.length === 0 ? "Không còn nhóm liên hệ nào để gán" : "Không tìm thấy kết quả"}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedGroupContactIds.size === filteredAvailableGroupContacts.length &&
                              filteredAvailableGroupContacts.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGroupContactIds(
                                  new Set(filteredAvailableGroupContacts.map((gc: GroupContact) => gc.id))
                                );
                              } else {
                                setSelectedGroupContactIds(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Tên nhóm</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAvailableGroupContacts.map((groupContact: GroupContact) => (
                        <TableRow key={groupContact.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedGroupContactIds.has(groupContact.id)}
                              onCheckedChange={() => toggleGroupContactSelection(groupContact.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{groupContact.name}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {groupContact.description || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {groupContact.isActive ? (
                              <Badge>Hoạt động</Badge>
                            ) : (
                              <Badge variant="secondary">Không hoạt động</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
