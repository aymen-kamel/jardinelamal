import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "دخول الإدارة — روضة الأمل" },
      {
        name: "description",
        content: "صفحة دخول خاصة بإدارة روضة الأمل لمتابعة طلبات التسجيل ورسائل الأولياء.",
      },
      { property: "og:title", content: "دخول الإدارة — روضة الأمل" },
      { property: "og:description", content: "تسجيل دخول فريق إدارة روضة الأمل." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    setLoading(false);
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
      return;
    }
    toast.success("مرحباً بك 👋");
    navigate({ to: "/admin", replace: true });
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم إنشاء الحساب. يمكنك الآن تسجيل الدخول.");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-center text-3xl font-bold">🔐 لوحة الإدارة</h1>
      <p className="mt-3 text-center text-muted-foreground">
        هذه الصفحة مخصصة لفريق إدارة الروضة فقط.
      </p>

      <Tabs defaultValue="signin" className="surface-card mt-8 p-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
          <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">البريد الإلكتروني</Label>
              <Input name="email" type="email" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">كلمة المرور</Label>
              <Input name="password" type="password" required minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full">
              {loading ? "..." : "دخول"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">البريد الإلكتروني</Label>
              <Input name="email" type="email" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">كلمة المرور</Label>
              <Input name="password" type="password" required minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full">
              {loading ? "..." : "إنشاء حساب"}
            </Button>
            <p className="text-xs text-muted-foreground">
              بعد إنشاء الحساب يجب منحه صلاحية المدير حتى يتمكن من الاطلاع على الطلبات.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
