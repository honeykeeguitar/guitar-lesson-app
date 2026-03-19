import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock, User, CalendarDays } from "lucide-react";
import type { Student } from "@shared/schema";

interface Schedule {
  id: string;
  studentId: string;
  dayOfWeek: number; // 0=일 1=월 2=화 3=수 4=목 5=금 6=토
  startTime: string;
  endTime: string;
  notes: string | null;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_FULL_LABELS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const DAY_COLORS = [
  "text-red-500", // 일
  "text-foreground",
  "text-foreground",
  "text-foreground",
  "text-foreground",
  "text-foreground",
  "text-blue-500", // 토
];

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function SchedulePage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form state
  const [formStudentId, setFormStudentId] = useState("");
  const [formDay, setFormDay] = useState("1");
  const [formStart, setFormStart] = useState("14:00");
  const [formEnd, setFormEnd] = useState("15:00");
  const [formNotes, setFormNotes] = useState("");

  const { data: schedules = [] } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
    queryFn: () => apiRequest("GET", "/api/schedules").then((r) => r.json()),
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    queryFn: () => apiRequest("GET", "/api/students").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({ title: "레슨 일정이 추가되었습니다" });
      setDialogOpen(false);
    },
    onError: () => toast({ title: "오류가 발생했습니다", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({ title: "일정이 수정되었습니다" });
      setDialogOpen(false);
    },
    onError: () => toast({ title: "오류가 발생했습니다", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({ title: "일정이 삭제되었습니다" });
    },
  });

  const studentMap = new Map(students.map((s) => [s.id, s]));

  function openCreate() {
    setEditingSchedule(null);
    setFormStudentId(students[0]?.id || "");
    setFormDay("1");
    setFormStart("14:00");
    setFormEnd("15:00");
    setFormNotes("");
    setDialogOpen(true);
  }

  function openEdit(schedule: Schedule) {
    setEditingSchedule(schedule);
    setFormStudentId(schedule.studentId);
    setFormDay(String(schedule.dayOfWeek));
    setFormStart(schedule.startTime);
    setFormEnd(schedule.endTime);
    setFormNotes(schedule.notes || "");
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!formStudentId) {
      toast({ title: "학생을 선택해주세요", variant: "destructive" });
      return;
    }
    const payload = {
      studentId: formStudentId,
      dayOfWeek: Number(formDay),
      startTime: formStart,
      endTime: formEnd,
      notes: formNotes || null,
    };
    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  // Group schedules by day (0=일 ~ 6=토)
  const schedulesByDay: Schedule[][] = Array.from({ length: 7 }, () => []);
  schedules.forEach((s) => {
    schedulesByDay[s.dayOfWeek]?.push(s);
  });
  // Sort each day by start time
  schedulesByDay.forEach((day) =>
    day.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  );

  const totalLessons = schedules.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">
            레슨 일정
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            주간 레슨 스케줄을 관리하세요
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          disabled={students.length === 0}
          data-testid="button-add-schedule"
        >
          <Plus className="w-4 h-4 mr-1" />
          일정 추가
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4" />
          <span>주간 총 {totalLessons}건</span>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 gap-3">
        {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
          const daySchedules = schedulesByDay[dayIdx];
          return (
            <Card key={dayIdx} className={daySchedules.length === 0 ? "opacity-60" : ""}>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-semibold ${DAY_COLORS[dayIdx]}`}>
                    {DAY_FULL_LABELS[dayIdx]}
                    {daySchedules.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {daySchedules.length}건
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {daySchedules.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-1">레슨 없음</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => {
                      const student = studentMap.get(schedule.studentId);
                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                          onClick={() => openEdit(schedule)}
                          data-testid={`schedule-${schedule.id}`}
                        >
                          {student && (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                              style={{ backgroundColor: student.avatarColor }}
                            >
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {student?.name || "알 수 없음"}
                              </span>
                              {student && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {student.guitarType === "acoustic"
                                    ? "통기타"
                                    : student.guitarType === "electric"
                                    ? "일렉기타"
                                    : "통기타/일렉"}
                                </Badge>
                              )}
                            </div>
                            {schedule.notes && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {schedule.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(schedule.id);
                            }}
                            data-testid={`button-delete-schedule-${schedule.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="text-center py-8">
          <User className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            학생을 먼저 등록해야 일정을 추가할 수 있습니다
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "일정 수정" : "레슨 일정 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>학생</Label>
              <Select value={formStudentId} onValueChange={setFormStudentId}>
                <SelectTrigger data-testid="select-student">
                  <SelectValue placeholder="학생 선택" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>요일</Label>
              <Select value={formDay} onValueChange={setFormDay}>
                <SelectTrigger data-testid="select-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_FULL_LABELS.map((label, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>시작 시간</Label>
                <Input
                  type="time"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  data-testid="input-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label>종료 시간</Label>
                <Input
                  type="time"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  data-testid="input-end-time"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>메모 (선택)</Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="레슨 관련 메모"
                rows={2}
                data-testid="input-schedule-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit-schedule"
            >
              {editingSchedule ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
