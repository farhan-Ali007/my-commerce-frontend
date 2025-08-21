import React from "react";
import HeroSection from "./HeroSection";
import RichTextSection from "./RichTextSection";
import ProductGridSection from "./ProductGridSection";

const registry = {
  hero: HeroSection,
  "rich-text": RichTextSection,
  "product-grid": ProductGridSection,
};

const SectionRenderer = ({ layout }) => {
  if (!layout || !Array.isArray(layout.sections)) return null;

  return (
    <div>
      {layout.sections.map((section, idx) => {
        const Component = registry[section.type];
        if (!Component) return null;
        return <Component key={section.id || `${section.type}-${idx}`} settings={section.settings || {}} blocks={section.blocks || []} />;
      })}
    </div>
  );
};

export default SectionRenderer;
