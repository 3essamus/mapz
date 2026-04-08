"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { 
  Home, Building2, Briefcase, User, Star, Heart, MapPin 
} from "lucide-react";

// Dynamic import for the map component
const LeafletMap = dynamic(
  () => import("@/components/leaflet-map").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    ),
  }
);

// Map Layers - exactly like original MesseMap
const MAP_LAYERS = {
  "OpenStreetMap": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "Imagery (E)": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "Voyager (C)": "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
  "Positron (C)": "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
  "Dark Matter (C)": "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  "Toner (S)": "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
  "Toner Lite (S)": "https://tiles.stadiamaps.com/tiles/stamen_toner-lite/{z}/{x}/{y}.png",
  "Watercolor (S)": "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
};

// Map Styles - exactly like original MesseMap  
const MAP_STYLES = [
  { id: "standard", label: "Standard", labelAr: "قياسي" },
  { id: "travel", label: "Travel", labelAr: "سفر" },
  { id: "frame", label: "Frame", labelAr: "إطار" },
  { id: "pure", label: "Pure", labelAr: "نقي" },
  { id: "tone", label: "Pantone", labelAr: "بانتون" },
  { id: "map", label: "Map", labelAr: "خريطة" },
  { id: "window", label: "Window", labelAr: "نافذة" },
  { id: "air", label: "Air", labelAr: "هواء" },
  { id: "hipster", label: "Hipster", labelAr: "هيبستر" },
];

// Export Sizes - like original MesseMap
const EXPORT_SIZES = [
  { label: "A7", width: 600, height: 848 },
  { label: "A6", width: 850, height: 1200 },
  { label: "A5", width: 1200, height: 1697 },
  { label: "A4", width: 1697, height: 2400 },
  { label: "A3", width: 2400, height: 3394 },
  { label: "A2", width: 3394, height: 4800 },
];

// Icon options
const ICON_OPTIONS = [
  { id: "home", Icon: Home },
  { id: "building", Icon: Building2 },
  { id: "briefcase", Icon: Briefcase },
  { id: "user", Icon: User },
  { id: "star", Icon: Star },
  { id: "heart", Icon: Heart },
  { id: "pin", Icon: MapPin },
];

export default function HomePage() {
  const { selectedLocation, setSelectedLocation } = useStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // State matching original MesseMap
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [mapStyle, setMapStyle] = useState("standard");
  const [selectedLayer, setSelectedLayer] = useState("Imagery (E)");
  const [darkTheme, setDarkTheme] = useState(false);
  const [textOnTop, setTextOnTop] = useState(false);
  
  // Text state
  const [title, setTitle] = useState("Messe Basse");
  const [subtitle, setSubtitle] = useState("France");
  const [comment, setComment] = useState("44.797°N / 1.542°E");
  const [lockComment, setLockComment] = useState(false);
  const [subtitleColor, setSubtitleColor] = useState("#999998");
  const [commentColor, setCommentColor] = useState("#999998");
  
  // Icon state
  const [showIcon, setShowIcon] = useState(false);
  const [iconSize, setIconSize] = useState(2);
  const [iconColor, setIconColor] = useState("#FFFFFF");
  const [selectedIcon, setSelectedIcon] = useState("home");
  
  // Export state
  const [exportSize, setExportSize] = useState(EXPORT_SIZES[0]);
  const [exportFormat, setExportFormat] = useState("png");
  
  // Section expand state
  const [expandedSections, setExpandedSections] = useState({
    style: true,
    text: true,
    icon: true,
    export: true,
  });

  // Update comment when map moves (like original)
  const updateComment = useCallback((lat: number, lng: number) => {
    if (!lockComment) {
      const latDir = lat >= 0 ? "N" : "S";
      const lngDir = lng >= 0 ? "E" : "W";
      setComment(`${Math.abs(lat).toFixed(3)}°${latDir} / ${Math.abs(lng).toFixed(3)}°${lngDir}`);
    }
  }, [lockComment]);

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    updateComment(lat, lng);
    
    // Reverse geocode
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
      );
      const data = await response.json();
      
      setSelectedLocation({
        lat,
        lng,
        address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    } catch {
      setSelectedLocation({
        lat,
        lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    }
  }, [updateComment, setSelectedLocation]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get container classes
  const getContainerClasses = () => {
    const classes = ["map-container", "shadow", `${mapStyle}-style`];
    if (orientation === "horizontal") classes.push("horizontal");
    if (darkTheme) classes.push("dark-theme");
    if (textOnTop) classes.push("txt-reverse");
    return classes.join(" ");
  };

  // Render user text wrapper based on style
  const renderTextWrapper = () => {
    const showLines = mapStyle === "standard";
    
    return (
      <div className="user-text-wrapper">
        <h1 id="title">{title}</h1>
        <h2>
          {showLines && <span className="before"></span>}
          <span className={showLines ? "subtitle" : ""} style={{ color: subtitleColor !== "#999998" ? subtitleColor : undefined }}>
            {subtitle}
          </span>
          {showLines && <span className="after"></span>}
        </h2>
        <p id="comment" style={{ color: commentColor !== "#999998" ? commentColor : undefined }}>
          {comment}
        </p>
      </div>
    );
  };

  // Get selected icon component
  const SelectedIconComponent = ICON_OPTIONS.find(i => i.id === selectedIcon)?.Icon || Home;

  return (
    <div className={`app-wrapper ${darkTheme ? "dark-theme" : "light-theme"}`}>
      {/* Sidebar - exactly like original MesseMap */}
      <aside>
        <header>
          <h1>MesseMap</h1>
        </header>
        
        <hr />
        
        <section>
          <div className="aside-content-wrapper">
            <p className="aside-helper">
              Browse the world, adjust your design, texts and colors, then download it!
            </p>

            {/* STYLE SECTION */}
            <h1 onClick={() => toggleSection("style")}>
              Style
              <span>{expandedSections.style ? "▲" : "▼"}</span>
            </h1>
            <div className={`category style-container ${expandedSections.style ? "expanded" : ""}`}>
              {/* Orientation */}
              <label>Map orientation</label>
              <div className="orientation-container">
                <span 
                  className={`click-item ${orientation === "vertical" ? "selected" : ""}`}
                  onClick={() => setOrientation("vertical")}
                >
                  Vertical
                </span>
                <span 
                  className={`click-item ${orientation === "horizontal" ? "selected" : ""}`}
                  onClick={() => setOrientation("horizontal")}
                >
                  Horizontal
                </span>
              </div>

              {/* Map Style */}
              <label>Map style</label>
              <div className="map-style">
                {MAP_STYLES.map((style) => (
                  <span
                    key={style.id}
                    className={`click-item ${mapStyle === style.id ? "selected" : ""}`}
                    onClick={() => setMapStyle(style.id)}
                  >
                    {style.label}
                  </span>
                ))}
              </div>

              {/* Dark Theme */}
              <div className="dark-theme-wrapper">
                <label>Dark theme</label>
                <input 
                  type="checkbox" 
                  className="switch"
                  checked={darkTheme}
                  onChange={(e) => setDarkTheme(e.target.checked)}
                />
              </div>

              {/* Text Position */}
              <div className="txt-position-wrapper">
                <label>Text on top</label>
                <input 
                  type="checkbox" 
                  className="switch"
                  checked={textOnTop}
                  onChange={(e) => setTextOnTop(e.target.checked)}
                />
              </div>
            </div>

            {/* TEXT SECTION */}
            <h1 onClick={() => toggleSection("text")}>
              Text
              <span>{expandedSections.text ? "▲" : "▼"}</span>
            </h1>
            <div className={`category texts-container ${expandedSections.text ? "expanded" : ""}`}>
              {/* Title */}
              <label>Map title</label>
              <div className="input-with-color">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title..."
                  maxLength={32}
                />
              </div>

              {/* Subtitle */}
              <label>Map subtitle</label>
              <div className="input-with-color">
                <input 
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Enter subtitle..."
                  maxLength={32}
                />
                <input 
                  type="color" 
                  value={subtitleColor}
                  onChange={(e) => setSubtitleColor(e.target.value)}
                  aria-label="Subtitle color"
                />
              </div>

              {/* Comment */}
              <label>Map comment</label>
              <div className="input-with-color">
                <input 
                  type="text"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setLockComment(true);
                  }}
                  placeholder="Enter comment..."
                  maxLength={42}
                />
                <input 
                  type="color" 
                  value={commentColor}
                  onChange={(e) => setCommentColor(e.target.value)}
                  aria-label="Comment color"
                />
              </div>

              {/* Lock Comment to Coordinates */}
              <div className="toggle-icon-wrapper" style={{ marginTop: "0.5rem" }}>
                <label>Lock to coordinates</label>
                <input 
                  type="checkbox"
                  checked={lockComment}
                  onChange={(e) => setLockComment(e.target.checked)}
                />
              </div>
            </div>

            {/* ICON SECTION */}
            <h1 onClick={() => toggleSection("icon")}>
              Icon
              <span>{expandedSections.icon ? "▲" : "▼"}</span>
            </h1>
            <div className={`category icon-container ${expandedSections.icon ? "expanded" : ""}`}>
              {/* Toggle Icon */}
              <div className="toggle-icon-wrapper">
                <label>Display icon</label>
                <input 
                  type="checkbox" 
                  className="switch"
                  checked={showIcon}
                  onChange={(e) => setShowIcon(e.target.checked)}
                />
              </div>

              {/* Icon Size */}
              <label id="icon-size-label">Icon size : {iconSize}</label>
              <input 
                type="range"
                min="1"
                max="16"
                value={iconSize}
                onChange={(e) => setIconSize(parseInt(e.target.value))}
              />

              {/* Icon Color */}
              <div className="icon-color-container">
                <label>Icon color</label>
                <input 
                  type="color" 
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  aria-label="Icon color"
                />
              </div>

              {/* Icon Images */}
              <label>Icon image</label>
              <div className="icon-images-container">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon.id}
                    className={`icon-btn ${selectedIcon === icon.id ? "selected" : ""}`}
                    onClick={() => setSelectedIcon(icon.id)}
                  >
                    <icon.Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* EXPORT SECTION */}
            <h1 onClick={() => toggleSection("export")}>
              Export
              <span>{expandedSections.export ? "▲" : "▼"}</span>
            </h1>
            <div className={`category export-container ${expandedSections.export ? "expanded" : ""}`}>
              {/* Dimension */}
              <label id="image-width-label">
                Dimension : {exportSize.width} x {exportSize.height} — {exportSize.label} at 300dpi
              </label>
              <input 
                type="range"
                min="600"
                max="4800"
                value={exportSize.width}
                onChange={(e) => {
                  const width = parseInt(e.target.value);
                  const closest = EXPORT_SIZES.reduce((prev, curr) => 
                    Math.abs(curr.width - width) < Math.abs(prev.width - width) ? curr : prev
                  );
                  setExportSize(closest);
                }}
              />

              {/* Size Presets */}
              <div className="size-container">
                {EXPORT_SIZES.map((size) => (
                  <span
                    key={size.label}
                    className={`click-item ${exportSize.label === size.label ? "selected" : ""}`}
                    onClick={() => setExportSize(size)}
                  >
                    {size.label}
                  </span>
                ))}
              </div>

              {/* Format Selection */}
              <fieldset>
                <legend>Export format</legend>
                {["png", "jpg", "webp", "pdf"].map((format) => (
                  <div key={format}>
                    <input 
                      type="radio"
                      id={format}
                      name="image-type"
                      checked={exportFormat === format}
                      onChange={() => setExportFormat(format)}
                    />
                    <label htmlFor={format}>.{format}</label>
                  </div>
                ))}
              </fieldset>
            </div>
          </div>
        </section>

        <hr />

        <footer>
          <Link href={selectedLocation ? "/checkout" : "#"}>
            <button disabled={!selectedLocation}>
              {selectedLocation ? "Proceed to Checkout" : "Select Location First"}
            </button>
          </Link>
          <a 
            href="https://messe-basse-production.com" 
            className="mbp-link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Messe Basse Production
          </a>
          <p className="credit-link">
            2022 / {new Date().getFullYear()} – Credits
          </p>
        </footer>
      </aside>

      {/* Main Map Area */}
      <main>
        <div 
          ref={mapContainerRef}
          className={`${getContainerClasses()} ${darkTheme ? "dark-theme" : "light-theme"}`}
        >
          <div className="map">
            <LeafletMap
              tileUrl={MAP_LAYERS[selectedLayer as keyof typeof MAP_LAYERS]}
              onMapClick={handleMapClick}
              onMapMove={updateComment}
              selectedLocation={selectedLocation}
            />
          </div>
          
          {renderTextWrapper()}
          
          {/* Icon overlay */}
          {showIcon && (
            <div 
              className="map-icon visible"
              style={{
                backgroundColor: iconColor,
                width: `${iconSize}rem`,
                height: `${iconSize}rem`,
                mask: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='${getIconPath(selectedIcon)}'/></svg>`)}") no-repeat center / contain`,
                WebkitMask: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='${getIconPath(selectedIcon)}'/></svg>`)}") no-repeat center / contain`,
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Helper function to get icon SVG path
function getIconPath(iconId: string): string {
  const paths: Record<string, string> = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
    briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  };
  return paths[iconId] || paths.home;
}
