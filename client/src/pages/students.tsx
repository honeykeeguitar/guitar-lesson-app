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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ArrowRight, UserPlus } from "lucide-react";
import type { Student } from "@shared/schema";

const AVATAR_COLORS = [
  "#c0392b", "#e74c3c", "#d35400", "#e67e22",
  "#f39c12", "#27ae60", "#2ecc71", "#16a085",
  "#1abc9c", "#2980b9", "#3498db", "#8e44ad",
  "#9b59b6", "#2c3e50", "#7f8c8d", "#34495e",
];

function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    queryFn: () => apiRequest("GET", "/api/students").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/students", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setDialogOpen(false);
      toast({ title: "학생이 추가되었습니다" });
    },
  });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: fd.get("name"),
      phone: fd.get("phone") || null,
      guitarType: fd.get("guitarType"),
      level: fd.get("level"),
      startDate: new Date().toISOString().split("T")[0],
      notes: fd.get("notes") || null,
      avatarColor: getRandomColor(),
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">학생 관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{students.length}명의 학생</p>
        </div>
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea id="notes" name="notes" placeholder="메모 (선택)" data-testid="input-student-notes" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-student">
                {createMutation.isPending ? "추가 중..." : "학생 추가"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">
            {search ? "검색 결과가 없습니다" : "학생을 추가해보세요"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
