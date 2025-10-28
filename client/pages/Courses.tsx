import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnhancedTextarea as Textarea } from "@/components/ui/enhanced-textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  StudySubject,
  StudyTopic,
  addSubject,
  addTopic,
  loadSubjects,
  loadTopics,
  loadSubjectsAsync,
  loadTopicsAsync,
  updateSubject,
  removeSubject,
  removeTopicsBySubject,
  updateTopic,
  removeTopic,
  getTopicsBySubject,
} from "@/lib/storage";

type Cat = "okul" | "TYT" | "AYT" | "YDT" | "LGS";

export default function Courses() {
  const { toast } = useToast();
  const [cat, setCat] = useState<Cat>("okul");
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [topicName, setTopicName] = useState("");
  const [topicMinutes, setTopicMinutes] = useState<string>("");
  const [topicEnergyLevel, setTopicEnergyLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [topicDifficulty, setTopicDifficulty] = useState<string>("");
  const [topicPriority, setTopicPriority] = useState<string>("");
  const [topicDeadline, setTopicDeadline] = useState<string>("");

  useEffect(() => {
    refreshAll();
     
  }, []);

  async function refreshAll() {
    const [subjectsData, topicsData] = await Promise.all([
      loadSubjectsAsync(),
      loadTopicsAsync()
    ]);
    setSubjects(subjectsData);
    setTopics(topicsData);
  }

  useEffect(() => {
    if (!selectedSubjectId) return;
    const inList = filteredSubjects.some((s) => s.id === selectedSubjectId);
    if (!inList) setSelectedSubjectId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, subjects]);

  const filteredSubjects = useMemo(() => {
    if (cat === "okul") return subjects.filter((s) => !s.category);
    return subjects.filter((s) => s.category === cat);
  }, [subjects, cat]);

  const currentSubject = useMemo(
    () => filteredSubjects.find((s) => s.id === selectedSubjectId),
    [filteredSubjects, selectedSubjectId],
  );

  const currentTopics = useMemo(
    () => topics.filter((t) => t.subjectId === selectedSubjectId),
    [topics, selectedSubjectId],
  );

  async function onAddSubject() {
    const name = newSubject.trim();
    if (!name) {
      toast({ title: "Ders adı gerekli", variant: "destructive" });
      return;
    }
    const exists = subjects.some(
      (s) =>
        (cat === "okul" ? !s.category : s.category === cat) &&
        s.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      toast({ title: "Bu ders zaten mevcut", variant: "destructive" });
      return;
    }
    const payload: StudySubject = {
      id: crypto.randomUUID(),
      name,
      category: cat === "okul" ? undefined : cat,
    };
    await addSubject(payload);
    await refreshAll();
    setNewSubject("");
    toast({ title: "Ders eklendi", description: subjectLabel(payload) });
  }

  async function onAddTopic() {
    if (!selectedSubjectId) {
      toast({ title: "Önce ders seçin", variant: "destructive" });
      return;
    }
    const name = topicName.trim();
    if (!name) {
      toast({ title: "Konu adı gerekli", variant: "destructive" });
      return;
    }
    const minutes = Number(topicMinutes || 0) || 0;
    
    let difficulty: number | undefined = undefined;
    if (topicDifficulty) {
      const diffNum = Number(topicDifficulty);
      if (isNaN(diffNum)) {
        toast({ title: "Zorluk geçerli bir sayı olmalıdır", variant: "destructive" });
        return;
      }
      if (diffNum < 1 || diffNum > 10) {
        toast({ title: "Zorluk 1-10 arasında olmalıdır", variant: "destructive" });
        return;
      }
      difficulty = diffNum;
    }
    
    let priority: number | undefined = undefined;
    if (topicPriority) {
      const prioNum = Number(topicPriority);
      if (isNaN(prioNum)) {
        toast({ title: "Öncelik geçerli bir sayı olmalıdır", variant: "destructive" });
        return;
      }
      if (prioNum < 1 || prioNum > 10) {
        toast({ title: "Öncelik 1-10 arasında olmalıdır", variant: "destructive" });
        return;
      }
      priority = prioNum;
    }
    
    const t: StudyTopic = {
      id: crypto.randomUUID(),
      subjectId: selectedSubjectId,
      name,
      avgMinutes: minutes,
      energyLevel: topicEnergyLevel,
      difficultyScore: difficulty,
      priority: priority,
      deadline: topicDeadline || undefined,
    };
    await addTopic(t);
    await refreshAll();
    setTopicName("");
    setTopicMinutes("");
    setTopicEnergyLevel('medium');
    setTopicDifficulty("");
    setTopicPriority("");
    setTopicDeadline("");
    toast({ title: "Konu eklendi", description: `${name} • ${minutes} dk` });
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dersler & Konular</h1>
        <p className="text-sm text-muted-foreground">
          Kategori seçin, ders ekleyin; ders altında konu ve tahmini süre girin.
        </p>
      </div>

      <Tabs value={cat} onValueChange={(v) => setCat(v as Cat)}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="okul">Okul Dersleri</TabsTrigger>
          <TabsTrigger value="TYT">TYT Dersleri</TabsTrigger>
          <TabsTrigger value="AYT">AYT Dersleri</TabsTrigger>
          <TabsTrigger value="YDT">YDT Dersleri</TabsTrigger>
          <TabsTrigger value="LGS">LGS Dersleri</TabsTrigger>
        </TabsList>

        <TabsContent value="okul">
          <CategoryPanel
            subjects={filteredSubjects}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            newSubject={newSubject}
            setNewSubject={setNewSubject}
            onAddSubject={onAddSubject}
            currentSubjectName={currentSubject?.name}
            topics={currentTopics}
            topicName={topicName}
            setTopicName={setTopicName}
            topicMinutes={topicMinutes}
            setTopicMinutes={setTopicMinutes}
            topicEnergyLevel={topicEnergyLevel}
            setTopicEnergyLevel={setTopicEnergyLevel}
            topicDifficulty={topicDifficulty}
            setTopicDifficulty={setTopicDifficulty}
            topicPriority={topicPriority}
            setTopicPriority={setTopicPriority}
            topicDeadline={topicDeadline}
            setTopicDeadline={setTopicDeadline}
            onAddTopic={onAddTopic}
            onRefresh={refreshAll}
          />
        </TabsContent>

        <TabsContent value="TYT">
          <CategoryPanel
            subjects={filteredSubjects}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            newSubject={newSubject}
            setNewSubject={setNewSubject}
            onAddSubject={onAddSubject}
            currentSubjectName={currentSubject?.name}
            topics={currentTopics}
            topicName={topicName}
            setTopicName={setTopicName}
            topicMinutes={topicMinutes}
            setTopicMinutes={setTopicMinutes}
            topicEnergyLevel={topicEnergyLevel}
            setTopicEnergyLevel={setTopicEnergyLevel}
            topicDifficulty={topicDifficulty}
            setTopicDifficulty={setTopicDifficulty}
            topicPriority={topicPriority}
            setTopicPriority={setTopicPriority}
            topicDeadline={topicDeadline}
            setTopicDeadline={setTopicDeadline}
            onAddTopic={onAddTopic}
            onRefresh={refreshAll}
          />
        </TabsContent>

        <TabsContent value="AYT">
          <CategoryPanel
            subjects={filteredSubjects}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            newSubject={newSubject}
            setNewSubject={setNewSubject}
            onAddSubject={onAddSubject}
            currentSubjectName={currentSubject?.name}
            topics={currentTopics}
            topicName={topicName}
            setTopicName={setTopicName}
            topicMinutes={topicMinutes}
            setTopicMinutes={setTopicMinutes}
            topicEnergyLevel={topicEnergyLevel}
            setTopicEnergyLevel={setTopicEnergyLevel}
            topicDifficulty={topicDifficulty}
            setTopicDifficulty={setTopicDifficulty}
            topicPriority={topicPriority}
            setTopicPriority={setTopicPriority}
            topicDeadline={topicDeadline}
            setTopicDeadline={setTopicDeadline}
            onAddTopic={onAddTopic}
            onRefresh={refreshAll}
          />
        </TabsContent>

        <TabsContent value="YDT">
          <CategoryPanel
            subjects={filteredSubjects}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            newSubject={newSubject}
            setNewSubject={setNewSubject}
            onAddSubject={onAddSubject}
            currentSubjectName={currentSubject?.name}
            topics={currentTopics}
            topicName={topicName}
            setTopicName={setTopicName}
            topicMinutes={topicMinutes}
            setTopicMinutes={setTopicMinutes}
            topicEnergyLevel={topicEnergyLevel}
            setTopicEnergyLevel={setTopicEnergyLevel}
            topicDifficulty={topicDifficulty}
            setTopicDifficulty={setTopicDifficulty}
            topicPriority={topicPriority}
            setTopicPriority={setTopicPriority}
            topicDeadline={topicDeadline}
            setTopicDeadline={setTopicDeadline}
            onAddTopic={onAddTopic}
            onRefresh={refreshAll}
          />
        </TabsContent>

        <TabsContent value="LGS">
          <CategoryPanel
            subjects={filteredSubjects}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            newSubject={newSubject}
            setNewSubject={setNewSubject}
            onAddSubject={onAddSubject}
            currentSubjectName={currentSubject?.name}
            topics={currentTopics}
            topicName={topicName}
            setTopicName={setTopicName}
            topicMinutes={topicMinutes}
            setTopicMinutes={setTopicMinutes}
            topicEnergyLevel={topicEnergyLevel}
            setTopicEnergyLevel={setTopicEnergyLevel}
            topicDifficulty={topicDifficulty}
            setTopicDifficulty={setTopicDifficulty}
            topicPriority={topicPriority}
            setTopicPriority={setTopicPriority}
            topicDeadline={topicDeadline}
            setTopicDeadline={setTopicDeadline}
            onAddTopic={onAddTopic}
            onRefresh={refreshAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function subjectLabel(s: StudySubject) {
  if (!s.category) return s.name;
  return `[${s.category}] ${s.name}`;
}

function CategoryPanel(props: {
  subjects: StudySubject[];
  selectedSubjectId: string;
  setSelectedSubjectId: (v: string) => void;
  newSubject: string;
  setNewSubject: (v: string) => void;
  onAddSubject: () => Promise<void>;
  currentSubjectName?: string;
  topics: StudyTopic[];
  topicName: string;
  setTopicName: (v: string) => void;
  topicMinutes: string;
  setTopicMinutes: (v: string) => void;
  topicEnergyLevel: 'high' | 'medium' | 'low';
  setTopicEnergyLevel: (v: 'high' | 'medium' | 'low') => void;
  topicDifficulty: string;
  setTopicDifficulty: (v: string) => void;
  topicPriority: string;
  setTopicPriority: (v: string) => void;
  topicDeadline: string;
  setTopicDeadline: (v: string) => void;
  onAddTopic: () => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    newSubject,
    setNewSubject,
    onAddSubject,
    currentSubjectName,
    topics,
    topicName,
    setTopicName,
    topicMinutes,
    setTopicMinutes,
    topicEnergyLevel,
    setTopicEnergyLevel,
    topicDifficulty,
    setTopicDifficulty,
    topicPriority,
    setTopicPriority,
    topicDeadline,
    setTopicDeadline,
    onAddTopic,
    onRefresh,
  } = props;

  const { toast } = useToast();
  const [editSubjectId, setEditSubjectId] = useState<string>("");
  const [editSubjectName, setEditSubjectName] = useState<string>("");

  const [bulkText, setBulkText] = useState("");

  const [editTopicId, setEditTopicId] = useState<string>("");
  const [editTopicName, setEditTopicName] = useState<string>("");
  const [editTopicMinutes, setEditTopicMinutes] = useState<string>("");
  const [editTopicEnergyLevel, setEditTopicEnergyLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [editTopicDifficulty, setEditTopicDifficulty] = useState<string>("");
  const [editTopicPriority, setEditTopicPriority] = useState<string>("");
  const [editTopicDeadline, setEditTopicDeadline] = useState<string>("");

  function startEditSubject(s: StudySubject) {
    setEditSubjectId(s.id);
    setEditSubjectName(s.name);
  }
  async function saveEditSubject() {
    const name = editSubjectName.trim();
    if (!editSubjectId || !name) return;
    await updateSubject(editSubjectId, { name });
    setEditSubjectId("");
    setEditSubjectName("");
    await onRefresh();
    toast({ title: "Ders güncellendi" });
  }
  function cancelEditSubject() {
    setEditSubjectId("");
    setEditSubjectName("");
  }
  async function confirmDeleteSubject(s: StudySubject) {
    const typed = window.prompt(`Silme onayı için ders adını yazın: ${s.name}`);
    if (typed !== s.name) return;
    const count = getTopicsBySubject(s.id).length;
    if (count > 0) {
      const sure = window.confirm(
        `${count} konu da silinecek. Devam edilsin mi?`,
      );
      if (!sure) return;
      await removeTopicsBySubject(s.id);
    }
    await removeSubject(s.id);
    if (selectedSubjectId === s.id) setSelectedSubjectId("");
    await onRefresh();
    toast({ title: "Ders silindi", description: subjectLabel(s) });
  }

  async function bulkAddTopics() {
    if (!selectedSubjectId) {
      toast({ title: "Önce ders seçin", variant: "destructive" });
      return;
    }
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast({ title: "Geçerli satır yok", variant: "destructive" });
      return;
    }
    let added = 0;
    for (const line of lines) {
      const m = line.match(/^(.*?)[,\-]\s*(\d+)$/);
      const name = m ? m[1].trim() : line;
      const minutes = m ? Number(m[2]) : 0;
      const t: StudyTopic = {
        id: crypto.randomUUID(),
        subjectId: selectedSubjectId,
        name,
        avgMinutes: minutes,
      };
      await addTopic(t);
      added++;
    }
    await onRefresh();
    setBulkText("");
    toast({
      title: "Toplu konu eklendi",
      description: `${added} konu eklendi`,
    });
  }

  function startEditTopic(t: StudyTopic) {
    setEditTopicId(t.id);
    setEditTopicName(t.name);
    setEditTopicMinutes(String(t.avgMinutes));
    setEditTopicEnergyLevel(t.energyLevel || 'medium');
    setEditTopicDifficulty(t.difficultyScore ? String(t.difficultyScore) : "");
    setEditTopicPriority(t.priority ? String(t.priority) : "");
    setEditTopicDeadline(t.deadline || "");
  }
  async function saveEditTopic() {
    const name = editTopicName.trim();
    const minutes = Number(editTopicMinutes || 0) || 0;
    
    let difficulty: number | undefined = undefined;
    if (editTopicDifficulty) {
      const diffNum = Number(editTopicDifficulty);
      if (isNaN(diffNum)) {
        toast({ title: "Zorluk geçerli bir sayı olmalıdır", variant: "destructive" });
        return;
      }
      if (diffNum < 1 || diffNum > 10) {
        toast({ title: "Zorluk 1-10 arasında olmalıdır", variant: "destructive" });
        return;
      }
      difficulty = diffNum;
    }
    
    let priority: number | undefined = undefined;
    if (editTopicPriority) {
      const prioNum = Number(editTopicPriority);
      if (isNaN(prioNum)) {
        toast({ title: "Öncelik geçerli bir sayı olmalıdır", variant: "destructive" });
        return;
      }
      if (prioNum < 1 || prioNum > 10) {
        toast({ title: "Öncelik 1-10 arasında olmalıdır", variant: "destructive" });
        return;
      }
      priority = prioNum;
    }
    
    if (!editTopicId || !name) return;
    await updateTopic(editTopicId, { 
      name, 
      avgMinutes: minutes,
      energyLevel: editTopicEnergyLevel,
      difficultyScore: difficulty,
      priority: priority,
      deadline: editTopicDeadline || undefined,
    });
    setEditTopicId("");
    setEditTopicName("");
    setEditTopicMinutes("");
    setEditTopicEnergyLevel('medium');
    setEditTopicDifficulty("");
    setEditTopicPriority("");
    setEditTopicDeadline("");
    await onRefresh();
    toast({ title: "Konu güncellendi" });
  }
  function cancelEditTopic() {
    setEditTopicId("");
    setEditTopicName("");
    setEditTopicMinutes("");
    setEditTopicEnergyLevel('medium');
    setEditTopicDifficulty("");
    setEditTopicPriority("");
    setEditTopicDeadline("");
  }
  async function confirmDeleteTopic(t: StudyTopic) {
    if (!window.confirm(`Konu silinsin mi? (${t.name})`)) return;
    await removeTopic(t.id);
    await onRefresh();
    toast({ title: "Konu silindi", description: t.name });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Dersler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ders adı"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <Button onClick={onAddSubject}>Ekle</Button>
          </div>
          <div className="divide-y rounded-md border">
            {subjects.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                Henüz ders yok. Yukarıdan ekleyin.
              </div>
            ) : (
              subjects.map((s) => (
                <div
                  key={s.id}
                  className={`flex w-full items-center justify-between p-3 ${selectedSubjectId === s.id ? "bg-accent" : "hover:bg-accent"}`}
                >
                  {editSubjectId === s.id ? (
                    <div className="flex w-full items-center gap-2">
                      <Input
                        value={editSubjectName}
                        onChange={(e) => setEditSubjectName(e.target.value)}
                      />
                      <Button size="sm" onClick={saveEditSubject}>
                        Kaydet
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditSubject}
                      >
                        İptal
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="text-left"
                        onClick={() => setSelectedSubjectId(s.id)}
                      >
                        {subjectLabel(s)}
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditSubject(s)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDeleteSubject(s)}
                        >
                          Sil
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>
            {currentSubjectName
              ? `Konu Ekle — ${currentSubjectName}`
              : "Konu Ekle"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <Input
              placeholder="Konu adı"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="md:col-span-2 lg:col-span-3"
            />
            <Input
              placeholder="Tahmini süre (dk)"
              value={topicMinutes}
              onChange={(e) => setTopicMinutes(e.target.value)}
            />
            <Select value={topicEnergyLevel} onValueChange={(v) => setTopicEnergyLevel(v as 'high' | 'medium' | 'low')}>
              <SelectTrigger>
                <SelectValue placeholder="Enerji Seviyesi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">⚡ Yüksek Enerji</SelectItem>
                <SelectItem value="medium">📊 Orta Enerji</SelectItem>
                <SelectItem value="low">🌙 Düşük Enerji</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Zorluk (1-10)"
              type="number"
              min="1"
              max="10"
              value={topicDifficulty}
              onChange={(e) => setTopicDifficulty(e.target.value)}
            />
            <Input
              placeholder="Öncelik (1-10)"
              type="number"
              min="1"
              max="10"
              value={topicPriority}
              onChange={(e) => setTopicPriority(e.target.value)}
            />
            <Input
              placeholder="Son tarih"
              type="date"
              value={topicDeadline}
              onChange={(e) => setTopicDeadline(e.target.value)}
            />
            <Button onClick={onAddTopic} disabled={!selectedSubjectId} className="md:col-span-2 lg:col-span-3">
              {selectedSubjectId ? "Konu Ekle" : "Önce ders seçin"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Textarea
              className="flex-1"
              placeholder="Toplu ekle: Her satır 'Konu adı - dakika' veya 'Konu adı, dakika'"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={bulkAddTopics}
              disabled={!selectedSubjectId}
            >
              Toplu Ekle
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Konu</TableHead>
                <TableHead className="w-24">Süre (dk)</TableHead>
                <TableHead className="w-28">Enerji</TableHead>
                <TableHead className="w-20">Zorluk</TableHead>
                <TableHead className="w-20">Öncelik</TableHead>
                <TableHead className="w-28">Son Tarih</TableHead>
                <TableHead className="w-16">
                  <span className="sr-only">İşlemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    {selectedSubjectId
                      ? "Bu ders için konu yok."
                      : "Ders seçin."}
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {editTopicId === t.id ? (
                        <Input
                          value={editTopicName}
                          onChange={(e) => setEditTopicName(e.target.value)}
                        />
                      ) : (
                        t.name
                      )}
                    </TableCell>
                    <TableCell className="w-24">
                      {editTopicId === t.id ? (
                        <Input
                          value={editTopicMinutes}
                          onChange={(e) => setEditTopicMinutes(e.target.value)}
                          className="w-20"
                        />
                      ) : (
                        t.avgMinutes
                      )}
                    </TableCell>
                    <TableCell className="w-28">
                      {editTopicId === t.id ? (
                        <Select value={editTopicEnergyLevel} onValueChange={(v) => setEditTopicEnergyLevel(v as 'high' | 'medium' | 'low')}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">⚡ Yüksek</SelectItem>
                            <SelectItem value="medium">📊 Orta</SelectItem>
                            <SelectItem value="low">🌙 Düşük</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">
                          {t.energyLevel === 'high' && '⚡ Yüksek'}
                          {t.energyLevel === 'medium' && '📊 Orta'}
                          {t.energyLevel === 'low' && '🌙 Düşük'}
                          {!t.energyLevel && '📊 Orta'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="w-20">
                      {editTopicId === t.id ? (
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editTopicDifficulty}
                          onChange={(e) => setEditTopicDifficulty(e.target.value)}
                          className="w-16"
                        />
                      ) : (
                        <span className="text-sm">{t.difficultyScore || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell className="w-20">
                      {editTopicId === t.id ? (
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editTopicPriority}
                          onChange={(e) => setEditTopicPriority(e.target.value)}
                          className="w-16"
                        />
                      ) : (
                        <span className="text-sm">{t.priority || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell className="w-28">
                      {editTopicId === t.id ? (
                        <Input
                          type="date"
                          value={editTopicDeadline}
                          onChange={(e) => setEditTopicDeadline(e.target.value)}
                          className="w-32"
                        />
                      ) : (
                        <span className="text-xs">{t.deadline ? new Date(t.deadline).toLocaleDateString('tr-TR') : '-'}</span>
                      )}
                    </TableCell>
                    <TableCell className="w-16">
                      {editTopicId === t.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEditTopic}>
                            Kaydet
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditTopic}
                          >
                            İptal
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label="İşlemler">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditTopic(t)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => confirmDeleteTopic(t)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
