import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Plus, Guitar, Music, Trash2 } from "lucide-react";
import type { CurriculumItem } from "@shared/schema";

export default function CurriculumPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: curriculum = [], isLoading } = useQuery<CurriculumItem[]>({
    queryKey: ["/api/curriculum"],
    queryFn: () => apiRequest("GET", "/api/curriculum").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/curriculum", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      setDialogOpen(false);
      toast({ title: "항목이 추가되었습니다" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/curriculum/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      toast({ title: "항목이 삭제되었습니다" });
    },
  });

  const acoustic = curriculum.filter(c => c.guitarType === "acoustic").sort((a, b) => a.order - b.order);
  const electric = curriculum.filter(c => c.guitarType === "electric").sort((a, b) => a.order - b.order);
  const ukulele = curriculum.filter(c => c.guitarType === "ukulele").sort((a, b) => a.order - b.order);

  function groupByLevelAndCategory(items: CurriculumItem[]) {
    const levels: Record<string, Record<string, CurriculumItem[]>> = {
      beginner: {},
      intermediate: {},
      advanced: {},
    };
    items.forEach(item => {
      if (!levels[item.level]) levels[item.level] = {};
      if (!levels[item.level][item.category]) levels[item.level][item.category] = [];
      levels[item.level][item.category].push(item);
    });
    return levels;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const guitarType = fd.get("guitarType") as string;
    const level = fd.get("level") as string;
    const existingItems = curriculum.filter(c => c.guitarType === guitarType && c.level === level);
    const maxOrder = existingItems.reduce((max, item) => Math.max(max, item.order), 0);

    createMutation.mutate({
      guitarType: fd.get("guitarType"),
      category: fd.get("category"),
      title: fd.get("title"),
      description: fd.get("description") || null,
      level: fd.get("level"),
      order: maxOrder + 1,
    });
  }

  const levelLabels: Record<string, string> = {
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급",
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-chart-3/10 text-chart-3",
    intermediate: "bg-chart-1/10 text-chart-1",
    advanced: "bg-chart-5/10 text-chart-5",
  };

  function renderCurriculumList(items: CurriculumItem[]) {
    const grouped = groupByLevelAndCategory(items);

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([level, categories]) => {
          const categoryEntries = Object.entries(categories);
          if (categoryEntries.length === 0) return null;
          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${levelColors[level]} border-0`}>
                  {levelLabels[level]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {categoryEntries.reduce((sum, [, items]) => sum + items.length, 0)}개 항목
                </span>
              </div>
              <Accordion type="multiple" defaultValue={categoryEntries.map(([cat]) => cat)}>
                {categoryEntries.map(([category, catItems]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-sm font-medium py-2">
                      {category} ({catItems.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-1">
                        {catItems.sort((a, b) => a.order - b.order).map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 py-2 px-2 rounded-md group"
                            data-testid={`curriculum-item-${item.id}`}
                          >
                            <span className="text-xs text-muted-foreground mt-0.5 w-5 text-right shrink-0">{idx + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{item.title}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 shrink-0 text-muted-foreground"
                              onClick={() => deleteMutation.mutate(item.id)}
                              data-testid={`button-delete-curriculum-${item.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">커리큘럼</h1>
          <p className="text-sm text-muted-foreground mt-0.5">통기타 / 일렉기타 / 우쿨렐레 레슨 커리큘럼 관리</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-curriculum">
              <Plus className="w-4 h-4 mr-1.5" />
              항목 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>커리큘럼 항목 추가</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>악기</Label>
                  <Select name="guitarType" defaultValue="acoustic">
                    <SelectTrigger data-testid="select-curriculum-guitar-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acoustic">통기타</SelectItem>
                      <SelectItem value="electric">일렉기타</SelectItem>
                      <SelectItem value="ukulele">우쿨렐레</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>레벨</Label>
                  <Select name="level" defaultValue="beginner">
                    <SelectTrigger data-testid="select-curriculum-level">
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
                <Label htmlFor="category">카테고리</Label>
                <Input id="category" name="category" required placeholder="예: 코드, 스케일, 테크닉" data-testid="input-curriculum-category" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" name="title" required placeholder="커리큘럼 항목 제목" data-testid="input-curriculum-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" name="description" placeholder="상세 설명 (선택)" data-testid="input-curriculum-description" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-curriculum">
                {createMutation.isPending ? "추가 중..." : "항목 추가"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="acoustic">
        <TabsList>
          <TabsTrigger value="acoustic" data-testid="tab-acoustic">
            <Guitar className="w-3.5 h-3.5 mr-1.5" />
            통기타 ({acoustic.length})
          </TabsTrigger>
          <TabsTrigger value="electric" data-testid="tab-electric">
            <Music className="w-3.5 h-3.5 mr-1.5" />
            일렉기타 ({electric.length})
          </TabsTrigger>
          <TabsTrigger value="ukulele" data-testid="tab-ukulele">
            <Music className="w-3.5 h-3.5 mr-1.5" />
            우쿨렐레 ({ukulele.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acoustic" className="mt-4">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          ) : (
            renderCurriculumList(acoustic)
          )}
        </TabsContent>

        <TabsContent value="electric" className="mt-4">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          ) : (
            renderCurriculumList(electric)
          )}
        </TabsContent>

        <TabsContent value="ukulele" className="mt-4">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          ) : (
            renderCurriculumList(ukulele)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
