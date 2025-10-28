import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/hooks/use-toast";
import {
  loadSettings,
  saveSettings,
  AppSettings,
  defaultSettings,
} from "@/lib/app-settings";
import { useSearchParams, useLocation } from "react-router-dom";
import GeneralSettingsTab from "@/components/settings/GeneralSettingsTab";
import NotificationsSettingsTab from "@/components/settings/NotificationsSettingsTab";
import DataSettingsTab from "@/components/settings/DataSettingsTab";
import IntegrationsSettingsTab from "@/components/settings/IntegrationsSettingsTab";
import AISettingsTab from "@/components/settings/AISettingsTab";
import CoursesSettingsTab from "@/components/settings/CoursesSettingsTab";
import PresentationSettingsTab from "@/components/settings/PresentationSettingsTab";
import ClassHoursSettingsTab from "@/components/settings/ClassHoursSettingsTab";
import SecuritySettingsTab from "@/components/settings/SecuritySettingsTab";
import TransferSettingsTab from "@/components/settings/TransferSettingsTab";

const schema = z.object({
  theme: z.enum(["light", "dark"]),
  language: z.enum(["tr", "en"]),
  dateFormat: z.enum(["dd.MM.yyyy", "yyyy-MM-dd"]),
  timeFormat: z.enum(["HH:mm", "hh:mm a"]),
  weekStart: z.union([z.literal(1), z.literal(7)]),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    digestHour: z.number().int().min(0).max(23),
  }),
  data: z.object({
    autosave: z.boolean(),
    autosaveInterval: z.number().int().min(1).max(60),
    anonymizeOnExport: z.boolean(),
    backupFrequency: z.enum(["never", "weekly", "monthly"]),
  }),
  integrations: z.object({
    mebisEnabled: z.boolean(),
    mebisToken: z.string().optional().nullable(),
    eokulEnabled: z.boolean(),
    eokulApiKey: z.string().optional().nullable(),
  }),
  privacy: z.object({
    analyticsEnabled: z.boolean(),
    dataSharingEnabled: z.boolean(),
  }),
  account: z.object({
    displayName: z.string().min(1),
    email: z.string().email(),
    institution: z.string().min(1),
    signature: z.string().optional().nullable(),
  }),
  school: z
    .object({
      periods: z
        .array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          }),
        )
        .default([]),
    })
    .default({ periods: [] }),
  presentationSystem: z.array(z.any()).default([]),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const [init, setInit] = useState<AppSettings>(defaultSettings());
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = useMemo(() => {
    const t = searchParams.get("tab") || "genel";
    const allowed = new Set([
      "genel",
      "bildirim",
      "veri",
      "entegrasyon",
      "ai",
      "dersler",
      "sunum-sistemi",
      "saatler",
      "guvenlik",
      "transfer",
    ]);
    return allowed.has(t) ? t : "genel";
  }, [searchParams]);
  const [tab, setTab] = useState<string>(initialTab);
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          0,
        );
      }
    }
  }, [location.hash, tab]);

  const form = useForm<AppSettings>({
    resolver: zodResolver(schema) as any,
    defaultValues: init,
    mode: "onChange",
  });

  useEffect(() => {
    loadSettings().then(settings => {
      setInit(settings);
      form.reset(settings);
    });
  }, []);

  useEffect(() => {
    const sub = form.watch((value, { name }) => {
      if (!value) return;
      if (name === "theme") {
        const root = document.documentElement;
        if (value.theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  const onSave = async (values: AppSettings) => {
    await saveSettings(values);
  };

  const onReset = async () => {
    const def = defaultSettings();
    await saveSettings(def);
    form.reset(def);
    const root = document.documentElement;
    if (def.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    toast({ title: "Ayarlar varsayılana döndü" });
  };

  const onExport = () => {
    const data = JSON.stringify(form.getValues(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rehber360-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = schema.parse(json) as AppSettings;
      await saveSettings(parsed);
      form.reset(parsed);
      const root = document.documentElement;
      if (parsed.theme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      toast({ title: "Ayarlar içe aktarıldı" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Geçersiz ayar dosyası",
        description: "JSON şeması hatalı",
      });
    } finally {
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Sistem Ayarları"
        subtitle="Uygulama genel tercihleri"
        icon={SettingsIcon}
        actions={
          <Button size="lg" onClick={form.handleSubmit(onSave as any)}>
            Kaydet
          </Button>
        }
      />
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setSearchParams((p) => {
            const np = new URLSearchParams(p);
            np.set("tab", v);
            return np;
          });
        }}
      >
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="genel">Genel</TabsTrigger>
          <TabsTrigger value="bildirim">Bildirimler</TabsTrigger>
          <TabsTrigger value="veri">Veri</TabsTrigger>
          <TabsTrigger value="entegrasyon">Entegrasyonlar</TabsTrigger>
          <TabsTrigger value="ai">AI Yapılandırma</TabsTrigger>
          <TabsTrigger value="dersler">Dersler & Konular</TabsTrigger>
          <TabsTrigger value="sunum-sistemi">Sunum Sistemi</TabsTrigger>
          <TabsTrigger value="saatler">Ders Saatleri</TabsTrigger>
          <TabsTrigger value="guvenlik">Güvenlik</TabsTrigger>
          <TabsTrigger value="transfer">İçe/Dışa Aktar</TabsTrigger>
        </TabsList>

        <TabsContent value="genel" className="mt-4">
          <GeneralSettingsTab form={form} />
        </TabsContent>

        <TabsContent value="bildirim" className="mt-4">
          <NotificationsSettingsTab form={form} />
        </TabsContent>

        <TabsContent value="veri" className="mt-4">
          <DataSettingsTab form={form} />
        </TabsContent>

        <TabsContent value="entegrasyon" className="mt-4">
          <IntegrationsSettingsTab form={form} />
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AISettingsTab />
        </TabsContent>

        <TabsContent value="dersler" className="mt-4">
          <CoursesSettingsTab />
        </TabsContent>

        <TabsContent value="sunum-sistemi" className="mt-4">
          <PresentationSettingsTab form={form} />
        </TabsContent>

        <TabsContent value="saatler" className="mt-4">
          <ClassHoursSettingsTab form={form} />
        </TabsContent>

        <TabsContent value="guvenlik" className="mt-4">
          <SecuritySettingsTab
            form={form}
            ack1={ack1}
            setAck1={setAck1}
            ack2={ack2}
            setAck2={setAck2}
            confirmEmail={confirmEmail}
            setConfirmEmail={setConfirmEmail}
            confirmCode={confirmCode}
            setConfirmCode={setConfirmCode}
            onReset={onReset}
            onExport={onExport}
          />
        </TabsContent>

        <TabsContent value="transfer" className="mt-4">
          <TransferSettingsTab onExport={onExport} onImport={onImport} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
