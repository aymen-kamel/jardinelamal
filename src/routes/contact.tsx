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
        content:
          "تواصل مع روضة الأمل بصفاقس: العنوان، أرقام الهاتف، البريد الإلكتروني ونموذج مراسلة مباشر.",
      },
      { property: "og:title", content: "اتصل بروضة الأمل" },
      {
        property: "og:description",
        content: "أرسل استفسارك إلى روضة الأمل بصفاقس وسنجيبك في أقرب وقت.",
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  phone: z.string().trim().min(6, "رقم الهاتف مطلوب").max(20),
  email: z.string().trim().email("بريد إلكتروني غير صحيح").max(255).or(z.literal("")),
  message: z.string().trim().min(5, "الرسالة مطلوبة").max(1000),
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      ...parsed.data,
      email: parsed.data.email || null,
    });
    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى");
      return;
    }
    formEl.reset();
    toast.success("✅ تم إرسال رسالتكم بنجاح، سنتواصل معكم قريباً");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-center text-3xl font-bold md:text-4xl">📞 اتصل بنا</h1>
      <p className="mt-3 text-center text-muted-foreground">
        نسعد بالإجابة على كل أسئلتكم حول التسجيل والأنشطة والنقل المدرسي.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="surface-card space-y-5 p-6">
          <div className="space-y-2">
            <Label className="font-semibold">الاسم</Label>
            <Input name="name" maxLength={100} placeholder="اسمك الكامل" />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">رقم الهاتف</Label>
            <Input name="phone" inputMode="tel" maxLength={20} placeholder="00 000 000" />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone}</p> : null}
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">البريد الإلكتروني (اختياري)</Label>
            <Input name="email" type="email" maxLength={255} placeholder="email@example.com" />
            {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">الرسالة</Label>
            <Textarea name="message" rows={5} maxLength={1000} placeholder="اكتب رسالتك هنا" />
            {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? "جاري الإرسال..." : "📩 إرسال"}
          </Button>
        </form>

        <div className="surface-card space-y-5 p-6">
          <h2 className="text-xl font-bold">📍 موقع الروضة</h2>
          <p className="leading-8">{SITE.address}</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              📞{" "}
              <a href={`tel:${SITE.phone1.replace(/\s/g, "")}`} className="hover:text-primary">
                <span dir="ltr" className="inline-block">{SITE.phone1}</span>
              </a>
            </li>
            <li>
              ☎️{" "}
              <a href={`tel:${SITE.phone2.replace(/\s/g, "")}`} className="hover:text-primary">
                <span dir="ltr" className="inline-block">{SITE.phone2}</span>
              </a>
            </li>
            <li>
              ✉️{" "}
              <a href={`mailto:${SITE.email}`} className="hover:text-primary">
                {SITE.email}
              </a>
            </li>
            <li>
              📘{" "}
              <a href={SITE.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-primary font-semibold">
                صفحتنا على الفايسبوك (jardinelamalsfax)
              </a>
            </li>
          </ul>
          <Button asChild variant="outline" className="w-full rounded-full">
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer">
              📍 افتح الموقع في خرائط Google
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
