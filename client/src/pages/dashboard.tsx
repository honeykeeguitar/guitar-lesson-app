import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Guitar, BookOpen, ArrowRight, Music } from "lucide-react";
import type { Student, CurriculumItem } from "@shared/schema";

export default function Dashboard() {
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    queryFn: () => apiRequest("GET", "/api/students").then(r => r.json()),
  });

  const { data: curriculum = [] } = useQuery<CurriculumItem[]>({
    queryKey: ["/api/curriculum"],
    queryFn: () => apiRequest("GET", "/api/curriculum").then(r => r.json()),
  });

  const acousticCount = curriculum.filter(c => c.guitarType === "acoustic").length;
  const electricCount = curriculum.filter(c => c.guitarType === "electric").length;
  const ukuleleCount = curriculum.filter(c => c.guitarType === "ukulele").length;

  const levelCounts = {
    beginner: students.filter(s => s.level === "beginner").length,
    intermediate: students.filter(s => s.level === "intermediate").length,
    advanced: students.filter(s => s.level === "advanced").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-page-title">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">기타 레슨 현황을 한 눈에 확인하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-student-count">{students.length}</p>
              <p className="text-xs text-muted-foreground">등록 학생</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10 text-chart-2">
              <Guitar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{acousticCount}</p>
              <p className="text-xs text-muted-foreground">통기타 항목</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-4/10 text-chart-4">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{electricCount}</p>
              <p className="text-xs text-muted-foreground">일렉기타 항목</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-3/10 text-chart-3">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ukuleleCount}</p>
              <p className="text-xs text-muted-foreground">우쿨렐레 항목</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">학생 목록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">아직 등록된 학생이 없습니다</p>
                <Link href="/students">
                  <Button size="sm" className="mt-3" data-testid="button-add-first-student">
                    학생 추가하기
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {students.slice(0, 5).map((student) => (
                  <Link key={student.id} href={`/students/${student.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer" data-testid={`card-student-${student.id}`}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                        style={{ backgroundColor: student.avatarColor }}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {student.guitarType === "acoustic" ? "통기타" : student.guitarType === "electric" ? "일렉기타" : student.guitarType === "ukulele" ? "우쿨렐레" : "통기타/일렉"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {student.level === "beginner" ? "초급" : student.level === "intermediate" ? "중급" : "고급"}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
                {students.length > 5 && (
                  <Link href="/students">
                    <Button variant="ghost" size="sm" className="w-full" data-testid="button-view-all-students">
                      전체 보기 ({students.length}명)
                    </Button>
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">레벨별 분포</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {students.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">학생을 추가하면 레벨 분포를 볼 수 있습니다</p>
              </div>
            ) : (
              <>
                {[
                  { label: "초급", count: levelCounts.beginner, color: "bg-chart-3" },
                  { label: "중급", count: levelCounts.intermediate, color: "bg-chart-1" },
                  { label: "고급", count: levelCounts.advanced, color: "bg-chart-5" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-medium">{count}명</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: students.length ? `${(count / students.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
