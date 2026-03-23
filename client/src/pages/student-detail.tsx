import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Plus, Calendar, Clock, CheckCircle2, Circle, BookOpen } from "lucide-react";
import type { Student, CurriculumItem, StudentProgress, LessonRecord, StudentGroup } from "@shared/schema";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const { data: student, isLoading: loadingStudent } = useQuery<Student>({
    queryKey: ["/api/students", id],
    queryFn: () => apiRequest("GET", `/api/students/${id}`).then(r => r.json()),
  });

  const { data: groups = [] } = useQuery<StudentGroup[]>({
    queryKey: ["/api/groups"],
    queryFn: () => apiRequest("GET", "/api/groups").then(r => r.json()),
  });

  const updateGroupMutation = useMutation({
    mutationFn: (groupId: string | null) =>
      apiRequest("PATCH", `/api/students/${id}`, { groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({ title: "그룹이 변경되었습니다" });
    },
  });

  const { data: curriculum = [] } = useQuery<CurriculumItem[]>({
    queryKey: ["/api/curriculum"],
    queryFn: () => apiRequest("GET", "/api/curriculum").then(r => r.json()),
  });

  const { data: progress = [] } = useQuery<StudentProgress[]>({
    queryKey: ["/api/students", id, "progress"],
    queryFn: () => apiRequest("GET", `/api/students/${id}/progress`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: lessons = [] } = useQuery<LessonRecord[]>({
    queryKey: ["/api/students", id, "lessons"],
    queryFn: () => apiRequest("GET", `/api/students/${id}/lessons`).then(r => r.json()),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      navigate("/students");
      toast({ title: "학생이 삭제되었습니다" });
    },
  });

  const progressMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/progress", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "progress"] });
    },
  });

  const lessonMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/lessons", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "lessons"] });
      setLessonDialogOpen(false);
      toast({ title: "레슨 기록이 추가되었습니다" });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => apiRequest("DELETE", `/api/lessons/${lessonId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "lessons"] });
      toast({ title: "레슨 기록이 삭제되었습니다" });
    },
  });

  if (loadingStudent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-32" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-16">
        <p className="text-muted-foreground">학생을 찾을 수 없습니다</p>
        <Button variant="ghost" onClick={() => navigate("/students")} className="mt-3">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 목록으로
        </Button>
      </div>
    );
  }

  // Filter curriculum by student's guitar type
  const relevantCurriculum = curriculum.filter(c => {
    if (student.guitarType === "both") return true;
    return c.guitarType === student.guitarType;
  });

  const progressMap = new Map(progress.map(p => [p.curriculumItemId, p]));
  const completedCount = progress.filter(p => p.status === "completed").length;
  const totalItems = relevantCurriculum.length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Group by guitarType then by category
  const grouped = relevantCurriculum.reduce((acc, item) => {
    const typeKey = item.guitarType === "acoustic" ? "통기타" : item.guitarType === "electric" ? "일렉기타" : "우쿨렐레";
    if (!acc[typeKey]) acc[typeKey] = {};
    if (!acc[typeKey][item.category]) acc[typeKey][item.category] = [];
    acc[typeKey][item.category].push(item);
    return acc;
  }, {} as Record<string, Record<string, CurriculumItem[]>>);

  // Sort categories by order of first item
  Object.values(grouped).forEach(categories => {
    Object.values(categories).forEach(items => {
      items.sort((a, b) => a.order - b.order);
    });
  });

  function toggleProgress(itemId: string) {
    const current = progressMap.get(itemId);
    const newStatus = current?.status === "completed" ? "not_started" : "completed";
    progressMutation.mutate({
      studentId: id,
      curriculumItemId: itemId,
      status: newStatus,
      completedDate: newStatus === "completed" ? new Date().toISOString().split("T")[0] : null,
      notes: current?.notes || null,
    });
  }

  function handleLessonSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    lessonMutation.mutate({
      studentId: id,
      date: fd.get("date"),
      duration: parseInt(fd.get("duration") as string),
      topics: fd.get("topics"),
      homework: fd.get("homework") || null,
      notes: fd.get("notes") || null,
    });
  }

  const levelMap: Record<string, string> = {
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/students")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0"
            style={{ backgroundColor: student.avatarColor }}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-student-name">{student.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary">
                {student.guitarType === "acoustic" ? "통기타" : student.guitarType === "electric" ? "일렉기타" : student.guitarType === "ukulele" ? "우쿨렐레" : "통기타/일렉"}
              </Badge>
              <Badge variant="outline">{levelMap[student.level]}</Badge>
              {student.phone && <span className="text-xs text-muted-foreground">{student.phone}</span>}
              {groups.length > 0 && (
                <Select
                  value={student.groupId ?? "__none__"}
                  onValueChange={(val) => updateGroupMutation.mutate(val === "__none__" ? null : val)}
                >
                  <SelectTrigger className="h-6 w-auto text-xs gap-1 border-dashed px-2" data-testid="select-student-group">
                    <SelectValue placeholder="그룹 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">그룹 없음</SelectItem>
                    {groups.map(g => (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                          {g.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive" data-testid="button-delete-student">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>학생 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                {student.name} 학생의 모든 데이터(진도, 레슨 기록)가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate()} data-testid="button-confirm-delete">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Progress overview */}
      <Card>
        <CardContent className="pt-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">전체 진도</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{totalItems} 완료 ({progressPercent}%)</span>
          </div>
          <Progress value={progressPercent} className="h-2" data-testid="progress-bar" />
        </CardContent>
      </Card>

      {/* Notes */}
      {student.notes && (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{student.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Curriculum / Lesson Records */}
      <Tabs defaultValue="curriculum">
        <TabsList>
          <TabsTrigger value="curriculum" data-testid="tab-curriculum">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            커리큘럼
          </TabsTrigger>
          <TabsTrigger value="lessons" data-testid="tab-lessons">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            레슨 기록
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="mt-4 space-y-6">
          {Object.entries(grouped).map(([typeName, categories]) => (
            <div key={typeName} className="space-y-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                {typeName}
              </h2>
              {Object.entries(categories).map(([category, items]) => {
                const catCompleted = items.filter(i => progressMap.get(i.id)?.status === "completed").length;
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
                      <span className="text-xs text-muted-foreground">{catCompleted}/{items.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const p = progressMap.get(item.id);
                        const isCompleted = p?.status === "completed";
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 py-2 px-2 rounded-md hover-elevate cursor-pointer group"
                            onClick={() => toggleProgress(item.id)}
                            data-testid={`curriculum-item-${item.id}`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/40" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {item.level === "beginner" ? "초급" : item.level === "intermediate" ? "중급" : "고급"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="lessons" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">레슨 기록</h2>
            <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-lesson">
                  <Plus className="w-4 h-4 mr-1" />
                  기록 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>레슨 기록 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLessonSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="date">날짜</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split("T")[0]}
                        data-testid="input-lesson-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">수업 시간 (분)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        required
                        defaultValue="50"
                        min="10"
                        max="180"
                        data-testid="input-lesson-duration"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topics">수업 내용</Label>
                    <Textarea
                      id="topics"
                      name="topics"
                      required
                      placeholder="오늘 수업에서 다룬 내용"
                      data-testid="input-lesson-topics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homework">숙제</Label>
                    <Input id="homework" name="homework" placeholder="다음 수업까지 연습할 내용" data-testid="input-lesson-homework" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lesson-notes">메모</Label>
                    <Textarea id="lesson-notes" name="notes" placeholder="추가 메모 (선택)" data-testid="input-lesson-notes" />
                  </div>
                  <Button type="submit" className="w-full" disabled={lessonMutation.isPending} data-testid="button-submit-lesson">
                    {lessonMutation.isPending ? "저장 중..." : "기록 저장"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">아직 레슨 기록이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <Card key={lesson.id} data-testid={`card-lesson-${lesson.id}`}>
                  <CardContent className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {lesson.date}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}분
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-7 w-7"
                        onClick={() => deleteLessonMutation.mutate(lesson.id)}
                        data-testid={`button-delete-lesson-${lesson.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm">{lesson.topics}</p>
                    {lesson.homework && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">숙제:</span> {lesson.homework}
                      </p>
                    )}
                    {lesson.notes && (
                      <p className="text-xs text-muted-foreground">{lesson.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
