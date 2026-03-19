import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ArrowRight, UserPlus, FolderPlus, MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight, Users } from "lucide-react";
import type { Student, StudentGroup } from "@shared/schema";

const AVATAR_COLORS = [
  "#c0392b", "#e74c3c", "#d35400", "#e67e22",
  "#f39c12", "#27ae60", "#2ecc71", "#16a085",
  "#1abc9c", "#2980b9", "#3498db", "#8e44ad",
  "#9b59b6", "#2c3e50", "#7f8c8d", "#34495e",
];

const GROUP_COLORS = [
  { value: "#e74c3c", label: "빨강" },
  { value: "#e67e22", label: "주황" },
  { value: "#f1c40f", label: "노랑" },
  { value: "#2ecc71", label: "초록" },
  { value: "#3498db", label: "파랑" },
  { value: "#9b59b6", label: "보라" },
  { value: "#e91e63", label: "핑크" },
  { value: "#795548", label: "브라운" },
];

function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    queryFn: () => apiRequest("GET", "/api/students").then(r => r.json()),
  });

  const { data: groups = [] } = useQuery<StudentGroup[]>({
    queryKey: ["/api/groups"],
    queryFn: () => apiRequest("GET", "/api/groups").then(r => r.json()),
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/students", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setDialogOpen(false);
      toast({ title: "학생이 추가되었습니다" });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/groups", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setGroupDialogOpen(false);
      toast({ title: "그룹이 생성되었습니다" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/groups/${id}`, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setEditingGroup(null);
      setGroupDialogOpen(false);
      toast({ title: "그룹이 수정되었습니다" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setDeleteGroupId(null);
      toast({ title: "그룹이 삭제되었습니다" });
    },
  });

  const updateStudentGroupMutation = useMutation({
    mutationFn: ({ studentId, groupId }: { studentId: string; groupId: string | null }) =>
      apiRequest("PATCH", `/api/students/${studentId}`, { groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
  });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group students: grouped students first (by group order), then ungrouped
  const groupedStudents = groups.map(group => ({
    group,
    students: filtered.filter(s => s.groupId === group.id),
  }));
  const ungroupedStudents = filtered.filter(s => !s.groupId);

  function toggleCollapse(groupId: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function handleStudentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const groupId = fd.get("groupId") as string;
    createStudentMutation.mutate({
      name: fd.get("name"),
      phone: fd.get("phone") || null,
      guitarType: fd.get("guitarType"),
      level: fd.get("level"),
      startDate: new Date().toISOString().split("T")[0],
      notes: fd.get("notes") || null,
      avatarColor: getRandomColor(),
      groupId: groupId === "__none__" ? null : groupId || null,
    });
  }

  function handleGroupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      color: fd.get("color") as string,
      order: editingGroup ? editingGroup.order : groups.length,
    };
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data });
    } else {
      createGroupMutation.mutate(data);
    }
  }

  function openEditGroup(group: StudentGroup) {
    setEditingGroup(group);
    setGroupDialogOpen(true);
  }

  function openNewGroup() {
    setEditingGroup(null);
    setGroupDialogOpen(true);
  }

  function StudentCard({ student }: { student: Student }) {
    return (
      <Link key={student.id} href={`/students/${student.id}`}>
        <Card className="cursor-pointer hover-elevate transition-all" data-testid={`card-student-${student.id}`}>
          <CardContent className="py-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
              style={{ backgroundColor: student.avatarColor }}
            >
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{student.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-xs">
                  {student.guitarType === "acoustic" ? "통기타" : student.guitarType === "electric" ? "일렉기타" : "통기타/일렉"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {student.level === "beginner" ? "초급" : student.level === "intermediate" ? "중급" : "고급"}
                </Badge>
                {student.phone && (
                  <span className="text-xs text-muted-foreground">{student.phone}</span>
                )}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">학생 관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{students.length}명의 학생</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openNewGroup} data-testid="button-add-group">
            <FolderPlus className="w-4 h-4 mr-1.5" />
            그룹
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-student">
                <Plus className="w-4 h-4 mr-1.5" />
                학생 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 학생 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" name="name" required placeholder="학생 이름" data-testid="input-student-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input id="phone" name="phone" placeholder="010-0000-0000" data-testid="input-student-phone" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>악기 유형</Label>
                    <Select name="guitarType" defaultValue="acoustic">
                      <SelectTrigger data-testid="select-guitar-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acoustic">통기타</SelectItem>
                        <SelectItem value="electric">일렉기타</SelectItem>
                        <SelectItem value="both">통기타/일렉</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>레벨</Label>
                    <Select name="level" defaultValue="beginner">
                      <SelectTrigger data-testid="select-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">초급</SelectItem>
                        <SelectItem value="intermediate">중급</SelectItem>
                        <SelectItem value="advanced">고급</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {groups.length > 0 && (
                  <div className="space-y-2">
                    <Label>그룹</Label>
                    <Select name="groupId" defaultValue="__none__">
                      <SelectTrigger data-testid="select-group">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">그룹 없음</SelectItem>
                        {groups.map(g => (
                          <SelectItem key={g.id} value={g.id}>
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                              {g.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="notes">메모</Label>
                  <Textarea id="notes" name="notes" placeholder="메모 (선택)" data-testid="input-student-notes" />
                </div>
                <Button type="submit" className="w-full" disabled={createStudentMutation.isPending} data-testid="button-submit-student">
                  {createStudentMutation.isPending ? "추가 중..." : "학생 추가"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {students.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="학생 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-student"
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 && groups.length === 0 ? (
        <div className="text-center py-16">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">
            {search ? "검색 결과가 없습니다" : "학생을 추가해보세요"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Grouped students */}
          {groupedStudents.map(({ group, students: groupStudents }) => (
            <div key={group.id} data-testid={`group-${group.id}`}>
              <div
                className="flex items-center gap-2 mb-2 cursor-pointer select-none group"
                onClick={() => toggleCollapse(group.id)}
              >
                {collapsedGroups.has(group.id) ? (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm font-semibold">{group.name}</span>
                <Badge variant="secondary" className="text-xs ml-1">{groupStudents.length}</Badge>
                <div className="flex-1" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`button-group-menu-${group.id}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditGroup(group)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      그룹 수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteGroupId(group.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      그룹 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {!collapsedGroups.has(group.id) && (
                <div className="space-y-2 ml-2 pl-4 border-l-2" style={{ borderColor: group.color + "40" }}>
                  {groupStudents.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 pl-1">이 그룹에 학생이 없습니다</p>
                  ) : (
                    groupStudents.map((student) => (
                      <StudentCard key={student.id} student={student} />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Ungrouped students */}
          {ungroupedStudents.length > 0 && (
            <div>
              {groups.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">미분류</span>
                  <Badge variant="secondary" className="text-xs ml-1">{ungroupedStudents.length}</Badge>
                </div>
              )}
              <div className={`space-y-2 ${groups.length > 0 ? "ml-2 pl-4 border-l-2 border-muted" : ""}`}>
                {ungroupedStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </div>
          )}

          {/* If search finds nothing */}
          {filtered.length === 0 && search && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* Group create/edit dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={(open) => {
        setGroupDialogOpen(open);
        if (!open) setEditingGroup(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? "그룹 수정" : "새 그룹 만들기"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGroupSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">그룹 이름</Label>
              <Input
                id="group-name"
                name="name"
                required
                placeholder="예: 월요반, 초급반, 성인반"
                defaultValue={editingGroup?.name ?? ""}
                data-testid="input-group-name"
              />
            </div>
            <div className="space-y-2">
              <Label>색상</Label>
              <div className="flex gap-2 flex-wrap">
                {GROUP_COLORS.map(({ value, label }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={value}
                      defaultChecked={editingGroup ? editingGroup.color === value : value === GROUP_COLORS[0].value}
                      className="sr-only peer"
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-foreground peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-foreground/20 transition-all"
                      style={{ backgroundColor: value }}
                      title={label}
                    />
                  </label>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
              data-testid="button-submit-group"
            >
              {(createGroupMutation.isPending || updateGroupMutation.isPending) ? "저장 중..." : editingGroup ? "수정" : "만들기"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete group confirmation dialog */}
      <Dialog open={!!deleteGroupId} onOpenChange={(open) => { if (!open) setDeleteGroupId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 삭제</DialogTitle>
            <DialogDescription>
              이 그룹을 삭제하시겠습니까? 그룹에 속한 학생은 삭제되지 않고 미분류로 이동됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupId(null)}>취소</Button>
            <Button
              variant="destructive"
              onClick={() => deleteGroupId && deleteGroupMutation.mutate(deleteGroupId)}
              disabled={deleteGroupMutation.isPending}
              data-testid="button-confirm-delete-group"
            >
              {deleteGroupMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
