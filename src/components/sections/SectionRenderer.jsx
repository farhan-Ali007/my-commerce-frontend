import React, { Suspense } from "react";
import { sectionsRegistry } from "./registry";

// Fallback skeleton for lazy-loaded sections
const SectionSkeleton = ({ className = "" }) => (
  <div className={`w-full h-40 md:h-60 bg-gray-100 animate-pulse rounded ${className}`} />
);

const SectionRenderer = ({ layout }) => {
  if (!layout || !Array.isArray(layout.sections)) return null;

  return (
    <div>
      {layout.sections.map((section, idx) => {
        const def = sectionsRegistry[section.type];
        const Component = def?.component;
        if (!Component) return null;
        return (
          <Suspense key={section.id || `${section.type}-${idx}`} fallback={<SectionSkeleton />}>
            <Component settings={section.settings || {}} blocks={section.blocks || []} />
          </Suspense>
        );
      })}
    </div>
  );
};

export default SectionRenderer;
