export const SITE = {
  name: "روضة الأمل",
  tagline: "حيث يبدأ مستقبل طفلك بثقة ومحبة",
  intro:
    "في روضة الأمل نوفر بيئة تعليمية آمنة ومحفزة تساعد الأطفال على التعلم واللعب واكتساب المهارات الأساسية في جو مليء بالحب والرعاية.",
  address:
    "طريق المحارزة، كم 3.5، القاصة الرابطة بين شارع البيئة وطريق المحارزة، صفاقس.",
  phone1: "54 449 264",
  phone2: "74 665 323",
  email: "jardinelamal@gmail.com",
  facebookUrl: "https://www.facebook.com/jardinelamalsfax",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("طريق المحارزة كم 3.5 صفاقس"),
} as const;

export const FEATURES = [
  { icon: "👩‍🏫", text: "إطار تربوي مؤهل وذو خبرة" },
  { icon: "🛡️", text: "فضاء آمن ونظيف" },
  { icon: "🌳", text: "ساحة واسعة للعب والأنشطة" },
  { icon: "🎨", text: "أنشطة تعليمية وترفيهية متنوعة" },
  { icon: "🍽️", text: "توفير وجبة فطور ولمجة موحدة" },
  { icon: "🚌", text: "النقل المدرسي متوفر" },
  { icon: "❤️", text: "متابعة يومية للأطفال" },
  { icon: "👨‍👩‍👧", text: "تواصل مستمر مع الأولياء" },
  { icon: "⭐", text: "أكثر من 20 سنة من الخبرة في تربية الأطفال" },
];

export const SECTIONS = [
  { value: "nursery", icon: "👶", title: "قسم الحضانة", age: "من سنتين إلى 3 سنوات" },
  { value: "middle", icon: "🧸", title: "القسم المتوسط", age: "من 3 إلى 4 سنوات" },
  { value: "preparatory", icon: "🎓", title: "القسم التحضيري", age: "من 4 إلى 5 سنوات" },
];

export const SECTION_LABELS: Record<string, string> = {
  nursery: "قسم الحضانة",
  middle: "القسم المتوسط",
  preparatory: "القسم التحضيري",
};

export const ACTIVITIES = [
  { icon: "🎵", name: "نادي الموسيقى" },
  { icon: "🕌", name: "نادي الإرشاد الديني" },
  { icon: "🧮", name: "نادي الحساب الذهني" },
  { icon: "🎭", name: "نادي المسرح" },
  { icon: "🎨", name: "نادي الرسم" },
  { icon: "🤸", name: "نادي التعبير الجسماني" },
  { icon: "⚽", name: "نادي الرياضة" },
  { icon: "🇸🇦", name: "اللغة العربية" },
  { icon: "🇫🇷", name: "اللغة الفرنسية" },
  { icon: "🇬🇧", name: "الإنجليزية للأطفال" },
  { icon: "🚌", name: "الرحلات والخرجات الترفيهية" },
];

export const SCHEDULE = [
  { icon: "🕗", time: "08:00", activity: "استقبال الأطفال" },
  { icon: "🎨", time: "09:00", activity: "أنشطة تعليمية" },
  { icon: "🍎", time: "10:30", activity: "استراحة" },
  { icon: "📚", time: "11:00", activity: "تعلم ولعب" },
  { icon: "🍽️", time: "12:30", activity: "وجبة الغداء" },
  { icon: "😴", time: "13:30", activity: "قيلولة" },
  { icon: "🎭", time: "15:00", activity: "أنشطة ترفيهية" },
  { icon: "🏠", time: "16:30", activity: "مغادرة الأطفال" },
];

export const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الدراسة",
  accepted: "مقبول",
  rejected: "مرفوض",
};
