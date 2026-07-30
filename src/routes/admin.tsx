import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { SECTION_LABELS, STATUS_LABELS } from "@/lib/site-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة إدارة روضة الأمل" },
      {
        name: "description",
        content: "متابعة طلبات التسجيل، رسائل الأولياء، ومعرض صور روضة الأمل.",
      },
      { property: "og:title", content: "لوحة إدارة روضة الأمل" },
      { property: "og:description", content: "إدارة الطلبات والرسائل والمعرض." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type SessionState = "loading" | "anonymous" | "not-admin" | "admin";

function useAdminSession() {
  const [state, setState] = useState<SessionState>("loading");

  useEffect(() => {
    let active = true;

    async function check() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setState("anonymous");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (!active) return;
      setState(isAdmin ? "admin" : "not-admin");
    }

    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ar-TN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "accepted"
      ? "bg-success text-success-foreground"
      : status === "rejected"
        ? "bg-destructive text-destructive-foreground"
        : "bg-sunny text-sunny-foreground";
  return <Badge className={`rounded-full ${tone}`}>{STATUS_LABELS[status] ?? status}</Badge>;
}

function AdminPage() {
  const state = useAdminSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const registrations = useQuery({
    queryKey: ["admin", "registrations"],
    enabled: state === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const messages = useQuery({
    queryKey: ["admin", "messages"],
    enabled: state === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const gallery = useQuery({
    queryKey: ["admin", "gallery"],
    enabled: state === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const items = data ?? [];
      return Promise.all(
        items.map(async (item) => {
          const { data: signed } = await supabase.storage
            .from("gallery")
            .createSignedUrl(item.image_url, 3600);
          return { ...item, url: signed?.signedUrl ?? "" };
        }),
      );
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "registrations"] });
      toast.success("تم تحديث حالة الطلب");
    },
    onError: () => toast.error("تعذر تحديث الطلب"),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "messages"] }),
  });

  const addImage = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) throw uploadError;
      const { error } = await supabase
        .from("gallery_images")
        .insert({ image_url: path, title: file.name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
      toast.success("تمت إضافة الصورة");
    },
    onError: () => toast.error("تعذر رفع الصورة"),
  });

  const deleteImage = useMutation({
    mutationFn: async ({ id, path }: { id: string; path: string }) => {
      await supabase.storage.from("gallery").remove([path]);
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
      toast.success("تم حذف الصورة");
    },
  });

  async function openDocument(path: string | null) {
    if (!path) return;
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (error || !data) {
      toast.error("تعذر فتح الوثيقة");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  useEffect(() => {
    if (state === "anonymous") {
      navigate({ to: "/auth", replace: true });
    }
  }, [state, navigate]);

  if (state === "loading" || state === "anonymous") {
    return <div className="px-4 py-24 text-center text-muted-foreground">جاري التحميل...</div>;
  }

  if (state === "not-admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">🚫 لا تملك صلاحية الإدارة</h1>
        <p className="mt-4 text-muted-foreground">
          يرجى التواصل مع مدير الروضة لمنح حسابك صلاحية الاطلاع على الطلبات.
        </p>
        <Button variant="outline" className="mt-6 rounded-full px-8" onClick={handleSignOut}>
          تسجيل الخروج
        </Button>
      </div>
    );
  }

  const regs = registrations.data ?? [];
  const stats = {
    total: regs.length,
    pending: regs.filter((r) => r.status === "pending").length,
    accepted: regs.filter((r) => r.status === "accepted").length,
    unread: (messages.data ?? []).filter((m) => !m.is_read).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">🔐 لوحة الإدارة</h1>
        <Button variant="outline" className="rounded-full" onClick={handleSignOut}>
          تسجيل الخروج
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "📊 مجموع الطلبات", value: stats.total },
          { label: "⏳ قيد الدراسة", value: stats.pending },
          { label: "✅ مقبولة", value: stats.accepted },
          { label: "📩 رسائل غير مقروءة", value: stats.unread },
        ].map((card) => (
          <div key={card.label} className="surface-card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="registrations" className="mt-10">
        <TabsList>
          <TabsTrigger value="registrations">📋 طلبات التسجيل</TabsTrigger>
          <TabsTrigger value="messages">📩 الرسائل</TabsTrigger>
          <TabsTrigger value="gallery">🖼️ المعرض</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="mt-6 space-y-4">
          {regs.length === 0 ? (
            <p className="text-muted-foreground">لا توجد طلبات بعد.</p>
          ) : null}
          {regs.map((reg) => (
            <div key={reg.id} className="surface-card space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold">
                  👶 {reg.child_first_name} {reg.child_last_name}
                </h3>
                <StatusBadge status={reg.status} />
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>🎂 تاريخ الميلاد: {reg.child_birth_date}</p>
                <p>⚧ الجنس: {reg.child_gender === "male" ? "ذكر" : "أنثى"}</p>
                <p>📚 القسم: {SECTION_LABELS[reg.section] ?? reg.section}</p>
                <p>🗓️ تاريخ الطلب: {formatDate(reg.created_at)}</p>
                <p>👤 الولي: {reg.parent_name}</p>
                <p>📞 الهاتف: {reg.parent_phone}</p>
                {reg.parent_email ? <p>✉️ {reg.parent_email}</p> : null}
                {reg.parent_address ? <p>📍 {reg.parent_address}</p> : null}
                {reg.notes ? <p className="sm:col-span-2">📝 {reg.notes}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "📄 شهادة الميلاد", path: reg.birth_certificate_path },
                  { label: "🪪 بطاقة الولي", path: reg.parent_id_path },
                  { label: "🖼️ صورة الطفل", path: reg.child_photo_path },
                ]
                  .filter((doc) => doc.path)
                  .map((doc) => (
                    <Button
                      key={doc.label}
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => openDocument(doc.path)}
                    >
                      {doc.label}
                    </Button>
                  ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => setStatus.mutate({ id: reg.id, status: "accepted" })}
                >
                  ✅ قبول
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => setStatus.mutate({ id: reg.id, status: "rejected" })}
                >
                  ❌ رفض
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="messages" className="mt-6 space-y-4">
          {(messages.data ?? []).length === 0 ? (
            <p className="text-muted-foreground">لا توجد رسائل بعد.</p>
          ) : null}
          {(messages.data ?? []).map((msg) => (
            <div key={msg.id} className="surface-card space-y-3 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">
                  {msg.name} — {msg.phone}
                </h3>
                {msg.is_read ? (
                  <Badge variant="secondary" className="rounded-full">
                    مقروءة
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => markRead.mutate(msg.id)}
                  >
                    تحديد كمقروءة
                  </Button>
                )}
              </div>
              {msg.email ? <p className="text-sm text-muted-foreground">✉️ {msg.email}</p> : null}
              <p className="leading-7">{msg.message}</p>
              <p className="text-xs text-muted-foreground">{formatDate(msg.created_at)}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="gallery" className="mt-6 space-y-6">
          <div className="surface-card p-6">
            <p className="font-semibold">إضافة صورة جديدة إلى المعرض</p>
            <Input
              type="file"
              accept="image/*"
              className="mt-3"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) addImage.mutate(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(gallery.data ?? []).map((image) => (
              <div key={image.id} className="surface-card overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title ?? "صورة من المعرض"}
                  loading="lazy"
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full rounded-full"
                    onClick={() => deleteImage.mutate({ id: image.id, path: image.image_url })}
                  >
                    🗑️ حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
