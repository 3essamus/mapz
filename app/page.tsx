"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "@/components/header";
import { useStore } from "@/lib/store";

const MapSelector = dynamic(
  () => import("@/components/map-selector").then((mod) => mod.MapSelector),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] lg:h-[500px] bg-secondary rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-muted-foreground">جاري تحميل الخريطة...</span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const selectedLocation = useStore((state) => state.selectedLocation);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
            اختر موقع التوصيل
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            حدد موقعك على الخريطة أو استخدم موقعك الحالي لنوصل طلبك بدقة
          </p>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-lg">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">حدد الموقع</h3>
              <p className="text-sm text-muted-foreground">انقر على الخريطة أو استخدم GPS</p>
            </div>
          </div>
          
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-lg">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">أدخل بياناتك</h3>
              <p className="text-sm text-muted-foreground">الاسم ورقم الهاتف</p>
            </div>
          </div>
          
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-lg">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">استلم واستلم</h3>
              <p className="text-sm text-muted-foreground">الدفع عند الاستلام</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="card p-4 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">الخريطة</h2>
            {selectedLocation && (
              <span className="text-sm text-success flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                تم التحديد
              </span>
            )}
          </div>
          <MapSelector />
        </div>

        {/* CTA Section */}
        <div className="card p-6 bg-accent/50 border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {selectedLocation ? "جاهز للمتابعة؟" : "حدد موقعك أولاً"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {selectedLocation
                  ? "اضغط على الزر للمتابعة وإدخال بيانات التوصيل"
                  : "انقر على الخريطة لتحديد موقع التوصيل"}
              </p>
            </div>
            <Link
              href="/checkout"
              className={`btn-primary whitespace-nowrap flex items-center gap-2 ${
                !selectedLocation ? "opacity-50 pointer-events-none" : ""
              }`}
              aria-disabled={!selectedLocation}
            >
              <span>متابعة الطلب</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 rotate-180">
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-primary-foreground"
                >
                  <path
                    fillRule="evenodd"
                    d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-semibold text-foreground">مابز</span>
            </div>
            <p className="text-sm text-muted-foreground">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
