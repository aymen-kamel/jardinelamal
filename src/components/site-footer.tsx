import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-primary">🌸 {SITE.name}</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{SITE.intro}</p>
        </div>
        <div>
          <h4 className="text-base font-bold">روابط سريعة</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                الصفحة الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary">
                التسجيل الإلكتروني
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                اتصل بنا
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-base font-bold">معلومات التواصل</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>📍 {SITE.address}</li>
            <li>
              📞{" "}
              <a href={`tel:${SITE.phone1.replace(/\s/g, "")}`} className="hover:text-primary">
                {SITE.phone1}
              </a>
            </li>
            <li>
              ☎️{" "}
              <a href={`tel:${SITE.phone2.replace(/\s/g, "")}`} className="hover:text-primary">
                {SITE.phone2}
              </a>
            </li>
            <li>
              ✉️{" "}
              <a href={`mailto:${SITE.email}`} className="hover:text-primary">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
