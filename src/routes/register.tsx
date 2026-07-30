import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SECTIONS } from "@/lib/site-data";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "التسجيل الإلكتروني — روضة الأمل صفاقس" },
      {
        name: "description",
        content:
          "استمارة التسجيل الإلكتروني في روضة الأمل: معلومات الطفل والولي وإرفاق الوثائق المطلوبة في خطوة واحدة.",
      },
      { property: "og:title", content: "التسجيل الإلكتروني — روضة الأمل" },
      {
        property: "og:description",
        content: "سجل طفلك في روضة الأمل بصفاقس عبر استمارة إلكترونية بسيطة مع إرفاق الوثائق.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  child_first_name: z.string().trim().min(2, "الاسم مطلوب").max(60),
  child_last_name: z.string().trim().min(2, "اللقب مطلوب").max(60),
  child_birth_date: z.string().min(1, "تاريخ الميلاد مطلوب"),
  child_gender: z.string().min(1, "الجنس مطلوب"),
  section: z.string().min(1),
  parent_name: z.string().trim().min(3, "اسم ولقب الولي مطلوب").max(120),
  parent_phone: z
    .string()
    .trim()
    .min(6, "رقم الهاتف مطلوب")
    .max(20, "رقم الهاتف طويل جداً"),
  parent_email: z.string().trim().email("بريد إلكتروني غير صحيح").max(255).or(z.literal("")),
  parent_address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(1000).optional(),
});


function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gender, setGender] = useState("");
  const [section, setSection] = useState("nursery");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      child_first_name: String(form.get("child_first_name") ?? ""),
      child_last_name: String(form.get("child_last_name") ?? ""),
      child_birth_date: String(form.get("child_birth_date") ?? ""),
      child_gender: gender,
      section,
      parent_name: String(form.get("parent_name") ?? ""),
      parent_phone: String(form.get("parent_phone") ?? ""),
      parent_email: String(form.get("parent_email") ?? ""),
      parent_address: String(form.get("parent_address") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("يرجى التحقق من البيانات المدخلة");
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { error } = await supabase.from("registrations").insert({
        ...parsed.data,
        parent_email: parsed.data.parent_email || null,
      });
      if (error) throw error;


      setDone(true);
      toast.success("تم إرسال طلب التسجيل بنجاح");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "تعذر إرسال الطلب، يرجى المحاولة مرة أخرى",
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="surface-card px-8 py-14">
          <div className="text-6xl" aria-hidden>
            ✅
          </div>
          <h1 className="mt-6 text-2xl font-bold">
            تم إرسال طلب التسجيل بنجاح، وسيتم التواصل معكم في أقرب وقت.
          </h1>
          <Button className="mt-8 rounded-full px-8" onClick={() => setDone(false)}>
            تسجيل طفل آخر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-center text-3xl font-bold md:text-4xl">📝 التسجيل الإلكتروني</h1>
      <p className="mt-3 text-center text-muted-foreground">
        املأ المعلومات التالية وأرفق الوثائق المطلوبة لإتمام طلب تسجيل طفلك.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <section className="surface-card space-y-5 p-6">
          <h2 className="text-xl font-bold">👶 معلومات الطفل</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="الاسم" error={errors.child_first_name}>
              <Input name="child_first_name" maxLength={60} placeholder="اسم الطفل" />
            </Field>
            <Field label="اللقب" error={errors.child_last_name}>
              <Input name="child_last_name" maxLength={60} placeholder="لقب الطفل" />
            </Field>
            <Field label="تاريخ الميلاد" error={errors.child_birth_date}>
              <Input name="child_birth_date" type="date" />
            </Field>
            <Field label="الجنس" error={errors.child_gender}>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="القسم المطلوب">
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.icon} {item.title} ({item.age})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </section>

        <section className="surface-card space-y-5 p-6">
          <h2 className="text-xl font-bold">👨‍👩‍👧 معلومات الولي</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="الاسم واللقب" error={errors.parent_name}>
              <Input name="parent_name" maxLength={120} placeholder="اسم ولقب الولي" />
            </Field>
            <Field label="رقم الهاتف" error={errors.parent_phone}>
              <Input name="parent_phone" inputMode="tel" maxLength={20} placeholder="00 000 000" />
            </Field>
            <Field label="البريد الإلكتروني (اختياري)" error={errors.parent_email}>
              <Input name="parent_email" type="email" maxLength={255} placeholder="email@example.com" />
            </Field>
            <Field label="العنوان" error={errors.parent_address}>
              <Input name="parent_address" maxLength={300} placeholder="العنوان الكامل" />
            </Field>
          </div>
          <Field label="ملاحظات إضافية (اختياري)" error={errors.notes}>
            <Textarea name="notes" maxLength={1000} rows={3} placeholder="أي معلومة تودون إضافتها" />
          </Field>
        </section>




        <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full text-base">
          {loading ? "جاري الإرسال..." : "🟢 إرسال طلب التسجيل"}
        </Button>
      </form>
    </div>
  );
}
