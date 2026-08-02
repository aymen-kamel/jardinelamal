import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE, FEATURES, SECTIONS, ACTIVITIES, SCHEDULE } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "روضة الأمل — صفاقس | التسجيل الإلكتروني" },
      { name: "description", content: SITE.intro },
      { property: "og:title", content: "روضة الأمل — صفاقس" },
      { property: "og:description", content: SITE.tagline },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: gallery } = useQuery({
    queryKey: ["gallery-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery_images")
        .select("id, image_url, title")
        .order("sort_order")
        .limit(12);
      const items = data ?? [];
      return Promise.all(
        items.map(async (img) => {
          const { data: signed } = await supabase.storage
            .from("gallery")
            .createSignedUrl(img.image_url, 3600);
          return { ...img, signedUrl: signed?.signedUrl ?? "" };
        }),
      );
    },
  });

  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="gradient-hero py-10 md:py-16">
        <div
          dir="ltr"
          className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 md:flex-row md:gap-10 md:px-10"
        >
          {/* Illustration — left, floating card */}
          <div className="w-full flex-shrink-0 md:w-[42%]">
            <img
              src="/hero-illustration.png"
              alt="أطفال يلعبون في روضة الأمل"
              className="h-auto w-full rounded-3xl object-cover shadow-md"
            />
          </div>

          {/* Text content — right, RTL */}
          <div
            dir="rtl"
            className="flex w-full flex-col items-start gap-4 text-right md:w-[58%]"
          >
            {/* Experience badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
              ⭐ أكثر من 20 سنة من الخبرة
            </div>

            {/* Title + logo icon */}
            <h1 className="flex items-center gap-3 text-right text-5xl font-bold leading-tight md:text-6xl">
              روضة الأمل
              <img
                src="/logo.png"
                alt=""
                aria-hidden
                className="h-14 w-14 object-contain"
              />
            </h1>

            {/* Tagline */}
            <p className="text-xl font-semibold text-muted-foreground md:text-2xl">
              {SITE.tagline}
            </p>

            {/* Intro */}
            <p className="max-w-md text-sm leading-7 text-muted-foreground md:text-base">
              {SITE.intro}
            </p>

            {/* CTA Buttons */}
            <div className="mt-3 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7 text-base">
                <Link to="/register">🟢 سجل طفلك الآن</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-white/60 px-7 text-base backdrop-blur-sm">
                <Link to="/contact">📞 اتصل بنا</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* ===== Features ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">لماذا روضة الأمل؟</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="surface-card flex items-start gap-4 p-5">
              <span className="mt-0.5 shrink-0 text-3xl" aria-hidden>
                {f.icon}
              </span>
              <span className="text-base font-semibold leading-7">{f.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Sections / Classrooms ===== */}
      <section className="bg-secondary/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-center text-3xl font-bold">أقسامنا</h2>
          <p className="mb-12 text-center text-muted-foreground">
            نوفر بيئة تعليمية ملائمة لكل مرحلة عمرية
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {SECTIONS.map((s) => (
              <div key={s.value} className="surface-card p-8 text-center">
                <div className="mb-4 text-5xl" aria-hidden>
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.age}</p>
                <Button asChild size="sm" variant="outline" className="mt-6 rounded-full">
                  <Link to="/register">التسجيل في هذا القسم</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Activities ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-3 text-center text-3xl font-bold">أنشطتنا</h2>
        <p className="mb-12 text-center text-muted-foreground">
          برامج متنوعة تنمي مواهب طفلك وتصقل شخصيته
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="surface-card flex items-center gap-3 px-5 py-3">
              <span className="text-2xl" aria-hidden>
                {a.icon}
              </span>
              <span className="text-sm font-semibold">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Daily Schedule ===== */}
      <section className="bg-secondary/40 px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-center text-3xl font-bold">يومنا في الروضة</h2>
          <p className="mb-12 text-center text-muted-foreground">
            برنامج يومي منظم يجمع بين التعلم والمرح
          </p>
          <div className="space-y-3">
            {SCHEDULE.map((item, i) => (
              <div key={i} className="surface-card flex items-center gap-5 px-6 py-4">
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
                <span dir="ltr" className="shrink-0 text-base font-bold text-primary">
                  {item.time}
                </span>
                <span className="font-semibold">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Gallery ===== */}
      {gallery && gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="mb-3 text-center text-3xl font-bold">معرض الصور</h2>
          <p className="mb-12 text-center text-muted-foreground">
            لحظات من حياة أطفالنا في روضة الأمل
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((img) => (
              <div key={img.id} className="aspect-square overflow-hidden rounded-2xl">
                <img
                  src={img.signedUrl}
                  alt={img.title ?? "صورة من الروضة"}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Map ===== */}
      <section className="bg-secondary/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-center text-3xl font-bold">موقعنا</h2>
          <p className="mb-10 text-center text-muted-foreground">{SITE.address}</p>
          <div className="aspect-video overflow-hidden rounded-3xl border border-border shadow-soft">
            <iframe
              src={SITE.mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="موقع روضة الأمل"
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold shadow-soft transition-colors hover:bg-muted"
            >
              🗺️ فتح في خرائط جوجل
            </a>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-5xl" aria-hidden>
            🎓
          </div>
          <h2 className="text-3xl font-bold">ابدأ رحلة طفلك معنا اليوم</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            سجل طفلك الآن واستفد من بيئة تعليمية متكاملة تجمع بين التعلم والمرح
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-10 text-base">
              <Link to="/register">📝 التسجيل الإلكتروني</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-10 text-base">
              <Link to="/contact">تواصل معنا</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
