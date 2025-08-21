import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiUpload, FiDownload, FiTrash2, FiPlus, FiChevronUp, FiChevronDown, FiSave } from "react-icons/fi";
import homeLayout from "../../config/sections/home.json";
import tplHomeDefault from "../../config/sections/templates/home.default.json";
import tplHomePromo from "../../config/sections/templates/home.promo.json";
import tplCollectionDefault from "../../config/sections/templates/collection.default.json";
import { saveDraft as apiSaveDraft, publishLayout as apiPublishLayout, getDraftBySlug as apiGetDraftBySlug } from "../../functions/pageLayout";

const DEFAULTS = {
  hero: {
    type: "hero",
    settings: {
      title: "Welcome to Etimad Mart",
      subtitle: "Top quality products. Great prices.",
      image: "/banner.jpg",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      align: "center",
    },
  },
  "rich-text": {
    type: "rich-text",
    settings: { html: "<p class=\"text-center\">Editable rich text</p>" },
  },
  "product-grid": {
    type: "product-grid",
    settings: { title: "Products", source: "featured", limit: 8, page: 1 },
  },
};

const SectionCard = ({ section, index, onMove, onDelete, onEdit }) => (
  <div className="border rounded p-3 bg-white shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm uppercase text-gray-500">{section.type}</div>
        <div className="text-xs text-gray-400">#{index + 1}</div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded hover:bg-gray-100" onClick={() => onMove(index, -1)} title="Move up">
          <FiChevronUp />
        </button>
        <button className="p-2 rounded hover:bg-gray-100" onClick={() => onMove(index, 1)} title="Move down">
          <FiChevronDown />
        </button>
        <button className="p-2 rounded hover:bg-gray-100" onClick={() => onDelete(index)} title="Delete">
          <FiTrash2 className="text-red-600" />
        </button>
      </div>
    </div>
    <textarea
      className="mt-2 w-full text-xs font-mono border rounded p-2"
      rows={6}
      value={JSON.stringify(section.settings || {}, null, 2)}
      onChange={(e) => onEdit(index, e.target.value)}
    />
  </div>
);

const AdminSections = () => {
  const [pageKey, setPageKey] = useState("home");
  const [layout, setLayout] = useState({ page: "home", sections: [] });
  const [rawJSON, setRawJSON] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Seed with imported home layout for now
    setLayout(homeLayout);
  }, []);

  useEffect(() => {
    setRawJSON(JSON.stringify(layout, null, 2));
  }, [layout]);

  const addSection = (type) => {
    const preset = DEFAULTS[type];
    if (!preset) return;
    setLayout((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), { id: `${type}-${Date.now()}`, ...preset }],
    }));
  };

  const templates = [
    { key: "home.default", label: "Home • Default", data: tplHomeDefault },
    { key: "home.promo", label: "Home • Promo", data: tplHomePromo },
    { key: "collection.default", label: "Collection • Default", data: tplCollectionDefault },
  ];

  const loadTemplate = (key) => {
    const t = templates.find((t) => t.key === key);
    if (!t) return;
    setLayout(t.data);
    setPageKey(t.data.page || "home");
    toast.success("Template loaded");
  };

  const moveSection = (index, dir) => {
    setLayout((prev) => {
      const arr = [...(prev.sections || [])];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      const tmp = arr[index];
      arr[index] = arr[newIndex];
      arr[newIndex] = tmp;
      return { ...prev, sections: arr };
    });
  };

  const deleteSection = (index) => {
    setLayout((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
  };

  const editSectionSettings = (index, jsonText) => {
    try {
      const next = JSON.parse(jsonText);
      setLayout((prev) => {
        const arr = [...prev.sections];
        arr[index] = { ...arr[index], settings: next };
        return { ...prev, sections: arr };
      });
    } catch (e) {
      // Keep editing; validation happens on save/export
    }
  };

  const loadFromJSONText = () => {
    try {
      const next = JSON.parse(rawJSON);
      if (!Array.isArray(next.sections)) throw new Error("Invalid layout: sections must be an array");
      setLayout(next);
      toast.success("Layout loaded");
    } catch (e) {
      toast.error("Invalid JSON");
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageKey}-layout.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveDraft = async () => {
    try {
      setLoading(true);
      await apiSaveDraft({ slug: pageKey, type: layout.type || "page", layout, seo: layout.seo });
      toast.success("Draft saved");
    } catch (e) {
      toast.error(e.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    try {
      setLoading(true);
      await apiPublishLayout({ slug: pageKey, layout, seo: layout.seo });
      toast.success("Published");
    } catch (e) {
      toast.error(e.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    try {
      setLoading(true);
      const data = await apiGetDraftBySlug(pageKey);
      const next = data.draftLayout || { page: pageKey, sections: [] };
      setLayout(next);
      setRawJSON(JSON.stringify(next, null, 2));
      toast.success("Draft loaded");
    } catch (e) {
      toast.error(e.message || "Failed to load draft");
    } finally {
      setLoading(false);
    }
  };

  const onUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setLayout(json);
      toast.success("Layout imported");
    } catch (e) {
      toast.error("Invalid file");
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">Sections Builder (MVP)</h1>
        <div className="flex items-center gap-2">
          <select
            className="px-2 py-2 border rounded"
            onChange={(e) => loadTemplate(e.target.value)}
            defaultValue=""
            title="Load template"
          >
            <option value="" disabled>Load template…</option>
            {templates.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <button className="inline-flex items-center gap-2 px-3 py-2 border rounded" onClick={loadDraft} disabled={loading} title="Load draft from server">
            <FiDownload /> {loading ? "Loading…" : "Load Draft"}
          </button>
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded">
            <FiUpload /> Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={onUploadFile} />
          </label>
          <button className="inline-flex items-center gap-2 px-3 py-2 border rounded" onClick={downloadJSON}>
            <FiDownload /> Export JSON
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 border rounded bg-blue-600 text-white disabled:opacity-50" onClick={saveDraft} disabled={loading}>
            <FiSave /> {loading ? "Saving…" : "Save Draft"}
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 border rounded bg-green-600 text-white disabled:opacity-50" onClick={publish} disabled={loading}>
            <FiSave /> {loading ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          {(layout.sections || []).map((s, idx) => (
            <SectionCard
              key={s.id || idx}
              section={s}
              index={idx}
              onMove={moveSection}
              onDelete={deleteSection}
              onEdit={editSectionSettings}
            />
          ))}

          <div className="flex items-center gap-2 mt-2">
            {Object.keys(DEFAULTS).map((t) => (
              <button key={t} className="inline-flex items-center gap-2 px-3 py-2 border rounded" onClick={() => addSection(t)}>
                <FiPlus /> Add {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-secondary">Layout JSON</div>
          <textarea
            className="w-full h-[480px] text-xs font-mono border rounded p-2"
            value={rawJSON}
            onChange={(e) => setRawJSON(e.target.value)}
          />
          <button className="inline-flex items-center gap-2 px-3 py-2 border rounded w-full" onClick={loadFromJSONText}>
            <FiSave /> Load from editor
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Note: Drafts are saved to the backend using your admin session. Use "Load Draft" to fetch the current draft.
      </p>
    </div>
  );
};

export default AdminSections;
