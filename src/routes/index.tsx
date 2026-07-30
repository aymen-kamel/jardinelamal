import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-kindergarten.jpg";
import { ACTIVITIES, FEATURES, SCHEDULE, SECTIONS, SITE } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "روضة الأمل — التسجيل الإلكتروني لرياض الأطفال بصفاقس" },
      {
        name: "description",
        content:
          "روضة الأمل بصفاقس: بيئة تعليمية آمنة، أقسام حسب السن، أنشطة متنوعة، ونقل مدرسي. سجل طفلك إلكترونياً في دقائق.",
      },
      { property: "og:title", content: "روضة الأمل — حيث يبدأ مستقبل طفلك بثقة ومحبة" },
      {
        property: "og:description",
        content: "أقسام حسب السن، أنشطة تربوية وترفيهية، ومتابعة يومية. التسجيل الإلكتروني متاح الآن.",
      },
    ],
  }),
  component: HomePage,
});



function useGalleryImages() {
  return useQuery({
    queryKey: ["gallery-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, image_url, title")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;

      const items = data ?? [];
      const signed = await Promise.all(
        items.map(async (item) => {
          const { data: url } = await supabase.storage
            .from("gallery")
            .createSignedUrl(item.image_url, 60 * 60);
          return { id: item.id, title: item.title, url: url?.signedUrl ?? null };
        }),
      );
      return signed.filter((item) => item.url);
    },
  });
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h2 className="text-center text-3xl font-bold md:text-4xl">
      <span className="ml-2" aria-hidden>
        {icon}
      </span>
      {children}
    </h2>
  );
}

function HomePage() {
  const { data: dbImages, isLoading: galleryLoading } = useGalleryImages();

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="text-center md:text-right">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-primary shadow-soft">
              ⭐ أكثر من 20 سنة من الخبرة
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
              🌸 {SITE.name}
            </h1>
            <p className="mt-3 text-xl font-semibold text-primary md:text-2xl">{SITE.tagline}</p>
            <p className="mt-5 text-base leading-8 text-muted-foreground">{SITE.intro}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button asChild size="lg" className="rounded-full px-8 text-base">
                <Link to="/register">🟢 سجل طفلك الآن</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full bg-card px-8 text-base"
              >
                <Link to="/contact">📞 اتصل بنا</Link>
              </Button>
            </div>
          </div>
          <img
            src={heroImage}
            alt="أطفال يلعبون في حديقة روضة الأمل"
            width={1600}
            height={1100}
            className="w-full rounded-[2rem] shadow-soft"
          />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle icon="❤️">لماذا تختار روضة الأمل؟</SectionTitle>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.text}
              className="surface-card flex items-start gap-3 p-5 transition-transform hover:-translate-y-1"
            >
              <span className="text-2xl" aria-hidden>
                {feature.icon}
              </span>
              <p className="pt-1 font-semibold leading-7">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sections */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle icon="📚">أقسام الروضة</SectionTitle>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SECTIONS.map((section) => (
              <div key={section.value} className="surface-card p-8 text-center">
                <div className="text-5xl" aria-hidden>
                  {section.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold">{section.title}</h3>
                <p className="mt-2 text-muted-foreground">{section.age}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle icon="🎨">الأنشطة</SectionTitle>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {ACTIVITIES.map((activity) => (
            <span
              key={activity.name}
              className="surface-card px-5 py-3 text-base font-semibold shadow-soft"
            >
              <span className="ml-2" aria-hidden>
                {activity.icon}
              </span>
              {activity.name}
            </span>
          ))}
        </div>
      </section>

      {/* Daily schedule */}
      <section className="bg-mint/30 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <SectionTitle icon="🕘">يوم في روضة الأمل</SectionTitle>
          <div className="surface-card mt-10 divide-y divide-border overflow-hidden">
            {SCHEDULE.map((slot) => (
              <div key={slot.time} className="flex items-center gap-4 px-6 py-4">
                <span className="text-2xl" aria-hidden>
                  {slot.icon}
                </span>
                <span className="w-20 font-bold text-primary">{slot.time}</span>
                <span className="font-semibold">{slot.activity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle icon="📸">معرض الصور</SectionTitle>
        <p className="mt-3 text-center text-muted-foreground">
          الأنشطة اليومية، الأقسام، الأطفال أثناء اللعب، الاحتفالات، الرحلات وفضاء الروضة.
        </p>
        {galleryLoading ? (
          <p className="mt-10 text-center text-muted-foreground">جاري تحميل الصور...</p>
        ) : (dbImages ?? []).length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">لا توجد صور في المعرض بعد.</p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(dbImages ?? []).map((image) => (
              <img
                key={image.id}
                src={image.url as string}
                alt={image.title ?? "صورة من روضة الأمل"}
                loading="lazy"
                className="h-64 w-full rounded-2xl object-cover shadow-soft"
              />
            ))}
          </div>
        )}
      </section>

      {/* Location */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionTitle icon="📍">موقع الروضة</SectionTitle>
          <p className="mt-6 text-lg leading-8">{SITE.address}</p>
          <p className="mt-4 text-muted-foreground">
            📞 <span dir="ltr" className="inline-block">{SITE.phone1}</span> — ☎️ <span dir="ltr" className="inline-block">{SITE.phone2}</span>
          </p>
          <p className="text-muted-foreground">✉️ {SITE.email}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8">
              <a href={SITE.mapsUrl} target="_blank" rel="noreferrer">
                📍 افتح الموقع في خرائط Google
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-card px-8">
              <a href={SITE.facebookUrl} target="_blank" rel="noreferrer">
                📘 صفحتنا على الفايسبوك
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="gradient-primary rounded-[2rem] px-8 py-12 text-center text-primary-foreground shadow-soft">
          <h2 className="text-3xl font-bold">📝 التسجيل الإلكتروني مفتوح</h2>
          <p className="mt-3 text-lg opacity-90">
            املأ الاستمارة وأرفق الوثائق، وسنتواصل معكم في أقرب وقت.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full px-8 text-base">
            <Link to="/register">🟢 إرسال طلب التسجيل</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
