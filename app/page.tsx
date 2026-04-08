"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";

const PosterMap = dynamic(
  () => import("@/components/poster-map").then((mod) => mod.PosterMap),
  {
    ssr: false,
    loading: () => (
      <div className="map-container standard-style vertical">
        <div className="map-area flex items-center justify-center bg-muted">
          <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div className="user-text-wrapper">
          <h1>مابز</h1>
          <h2>
            <span className="line-before"></span>
            <span className="subtitle-text">اختر موقعك</span>
            <span className="line-after"></span>
          </h2>
          <p>44.797°N / 1.542°E</p>
        </div>
      </div>
    ),
  }
);

const MAP_LAYERS = [
  "OpenStreetMap",
  "Imagery (E)",
  "Voyager (C)",
  "Positron (C)",
  "Dark Matter (C)",
  "Toner (S)",
  "Watercolor (S)",
];

const MAP_STYLES = [
  { id: "standard", label: "قياسي" },
  { id: "travel", label: "سفر" },
  { id: "frame", label: "إطار" },
  { id: "pure", label: "نقي" },
];

export default function HomePage() {
  const selectedLocation = useStore((state) => state.selectedLocation);
  
  // Map settings state (matching original MesseMap)
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [selectedLayer, setSelectedLayer] = useState("Imagery (E)");
  const [darkTheme, setDarkTheme] = useState(false);
  const [textOnTop, setTextOnTop] = useState(false);
  const [title, setTitle] = useState("مابز");
  const [subtitle, setSubtitle] = useState("اختر موقعك");
  const [expandedSections, setExpandedSections] = useState({
    style: true,
    text: true,
    export: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar - matching original MesseMap */}
      <aside className="sidebar">
        <header>
          <h1>مابز</h1>
        </header>
        
        <hr />
        
        <section className="sidebar-content">
          <p className="sidebar-helper">
            تصفح الخريطة، اختر موقعك، ثم أكمل طلبك!
          </p>

          {/* Style Section */}
          <div 
            className="category-title"
            onClick={() => toggleSection("style")}
          >
            <span>النمط</span>
            <span>{expandedSections.style ? "▲" : "▼"}</span>
          </div>
          
          {expandedSections.style && (
            <div className="category-content">
              {/* Orientation */}
              <label className="block text-sm text-muted-foreground mb-2 italic">اتجاه الخريطة</label>
              <div className="flex flex-wrap gap-2 mb-4">
                <span 
                  className={`click-item ${orientation === "vertical" ? "selected" : ""}`}
                  onClick={() => setOrientation("vertical")}
                >
                  عمودي
                </span>
                <span 
                  className={`click-item ${orientation === "horizontal" ? "selected" : ""}`}
                  onClick={() => setOrientation("horizontal")}
                >
                  أفقي
                </span>
              </div>

              {/* Map Layer */}
              <label className="block text-sm text-muted-foreground mb-2 italic">طبقة الخريطة</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {MAP_LAYERS.map((layer) => (
                  <span
                    key={layer}
                    className={`click-item ${selectedLayer === layer ? "selected" : ""}`}
                    onClick={() => setSelectedLayer(layer)}
                  >
                    {layer}
                  </span>
                ))}
              </div>

              {/* Dark Theme Toggle */}
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm">المظهر الداكن</label>
                <input 
                  type="checkbox" 
                  className="switch-toggle"
                  checked={darkTheme}
                  onChange={(e) => setDarkTheme(e.target.checked)}
                />
              </div>

              {/* Text Position Toggle */}
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm">النص في الأعلى</label>
                <input 
                  type="checkbox" 
                  className="switch-toggle"
                  checked={textOnTop}
                  onChange={(e) => setTextOnTop(e.target.checked)}
                />
              </div>
            </div>
          )}

          {/* Text Section */}
          <div 
            className="category-title"
            onClick={() => toggleSection("text")}
          >
            <span>النص</span>
            <span>{expandedSections.text ? "▲" : "▼"}</span>
          </div>
          
          {expandedSections.text && (
            <div className="category-content">
              {/* Title Input */}
              <label className="block text-sm text-muted-foreground mb-2 italic">العنوان</label>
              <input 
                type="text"
                className="sidebar-input mb-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل العنوان"
                maxLength={32}
              />

              {/* Subtitle Input */}
              <label className="block text-sm text-muted-foreground mb-2 italic">العنوان الفرعي</label>
              <input 
                type="text"
                className="sidebar-input mb-4"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="أدخل العنوان الفرعي"
                maxLength={32}
              />

              {/* Location Info */}
              {selectedLocation && (
                <div className="bg-success/20 border border-success/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-success mb-1">تم تحديد الموقع</p>
                  <p className="text-sm line-clamp-2">{selectedLocation.address}</p>
                </div>
              )}
            </div>
          )}

          {/* Export / Action Section */}
          <div 
            className="category-title"
            onClick={() => toggleSection("export")}
          >
            <span>الطلب</span>
            <span>{expandedSections.export ? "▲" : "▼"}</span>
          </div>
          
          {expandedSections.export && (
            <div className="category-content">
              <p className="text-sm text-muted-foreground mb-4">
                {selectedLocation 
                  ? "موقعك جاهز! اضغط على الزر أدناه للمتابعة وإدخال بيانات التوصيل."
                  : "انقر على الخريطة لتحديد موقع التوصيل، ثم أكمل طلبك."}
              </p>
              
              {/* Order Summary */}
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>الموقع</span>
                  <span className={selectedLocation ? "text-success" : "text-destructive"}>
                    {selectedLocation ? "محدد" : "غير محدد"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>طريقة الدفع</span>
                  <span>عند الاستلام</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <hr />

        <footer className="sidebar-footer">
          <Link href={selectedLocation ? "/checkout" : "#"}>
            <button disabled={!selectedLocation}>
              متابعة الطلب
            </button>
          </Link>
          <p className="credit-link">
            2024 / {new Date().getFullYear()} – مابز
          </p>
        </footer>
      </aside>

      {/* Main Map Area */}
      <main className="main-area">
        <PosterMap
          selectedLayer={selectedLayer}
          title={title}
          subtitle={subtitle}
          darkTheme={darkTheme}
          textOnTop={textOnTop}
          orientation={orientation}
        />
      </main>
    </div>
  );
}
