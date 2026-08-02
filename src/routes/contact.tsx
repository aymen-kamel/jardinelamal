import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "اتصل بنا — روضة الأمل صفاقس" },
      {
        name: "description",
        content: "تواصلوا مع روضة الأمل بصفاقس عبر النموذج الإلكتروني أو الهاتف أو البريد الإلكتروني.",
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(150),
  phone: z.string().trim().min(6, "رقم الهاتف مطلوب").max(30, "رقم الهاتف طويل جداً"),
  email: z.string().trim().email("بريد إلكتروني غير صحيح").max(255).or(z.literal("")),
  message: z.string().trim().min(1, "الرسالة مطلوبة").max(2000),
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

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // Honeypot: hidden from real users, often auto-filled by bots. Pretend success.
    if (String(form.get("website") ?? "").length > 0) {
      setDone(true);
      return;
    }

    const values = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
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
      const { error } = await supabase.from("contact_messages").insert({
        ...parsed.data,
        email: parsed.data.email || null,
      });
      if (error) throw error;

      setDone(true);
      toast.success("تم إرسال رسالتكم بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى");
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
          <h1 className="mt-6 text-2xl font-bold">تم إرسال رسالتكم بنجاح، وسيتم التواصل معكم في أقرب وقت.</h1>
          <Button className="mt-8 rounded-full px-8" onClick={() => setDone(false)}>
            إرسال رسالة أخرى
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-center text-3xl font-bold md:text-4xl">📞 اتصل بنا</h1>
      <p className="mt-3 text-center text-muted-foreground">
        يسعدنا تواصلكم معنا لأي استفسار أو ملاحظة.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="surface-card space-y-4 p-6 text-center md:text-right">
          <h2 className="text-xl font-bold">معلومات التواصل</h2>
          <p>📍 {SITE.address}</p>
          <p dir="ltr" className="text-right">
            📞 {SITE.phone1}
          </p>
          <p dir="ltr" className="text-right">
            ☎️ {SITE.phone2}
          </p>
          <p dir="ltr" className="text-right">
            ✉️ {SITE.email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card space-y-5 p-6">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />
          <Field label="الاسم واللقب" error={errors.name}>
            <Input name="name" maxLength={150} placeholder="اسمكم الكامل" />
          </Field>
          <Field label="رقم الهاتف" error={errors.phone}>
            <Input name="phone" inputMode="tel" maxLength={30} placeholder="00 000 000" />
          </Field>
          <Field label="البريد الإلكتروني (اختياري)" error={errors.email}>
            <Input name="email" type="email" maxLength={255} placeholder="email@example.com" />
          </Field>
          <Field label="الرسالة" error={errors.message}>
            <Textarea name="message" maxLength={2000} rows={5} placeholder="اكتبوا رسالتكم هنا" />
          </Field>
          <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full text-base">
            {loading ? "جاري الإرسال..." : "🟢 إرسال الرسالة"}
          </Button>
        </form>
      </div>
    </div>
  );
}
