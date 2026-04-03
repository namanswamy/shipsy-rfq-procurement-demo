import React, { useState, useCallback } from "react";
import C from "../config/colors";
import { LINE_ITEM_FIELDS, generateLineItems } from "../config/rfqConfig";
import {
  Dropdown, MultiSelectDropdown, TextInput, TextArea, FileUpload,
  CloseIcon, BackIcon, SectionHeader,
} from "./Common";

export default function LineItemCreation({ tender, onClose, onSave }) {
  const vendorType = tender.vendorType;
  const config = LINE_ITEM_FIELDS[vendorType];
  const [dd, setDd] = useState({});
  const [form, setForm] = useState({});
  const [collapsed, setCollapsed] = useState({});

  const tog = useCallback((key) => (val) => setDd((p) => ({ ...p, [key]: val })), []);
  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  if (!config) {
    return (
      <>
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 500 }} />
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 700,
          background: C.white, zIndex: 600, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          animation: "slideIn .3s ease-out", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 16, color: C.textMuted }}>
            Line item creation is not available for {vendorType}.
          </span>
          <button onClick={onClose} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer" }}>Close</button>
        </div>
      </>
    );
  }

  const handleSave = () => {
    const items = generateLineItems(vendorType, form);
    if (items.length === 0) {
      alert("Please fill required fields to generate line items.");
      return;
    }
    onSave(items, form);
  };

  const previewCount = (() => {
    const items = generateLineItems(vendorType, form);
    return items.length;
  })();

  const renderField = (field) => {
    // Handle conditional fields
    if (field.conditionalOn) {
      if (form[field.conditionalOn.field] !== field.conditionalOn.value) return null;
    }

    const key = field.key;

    if (field.type === "multiselect") {
      return (
        <MultiSelectDropdown
          key={key} label={field.label} required={field.required}
          values={form[key] || []} placeholder={`Select ${field.label}`}
          options={field.options || []}
          open={dd[key]} onToggle={tog(key)} onChange={set(key)}
        />
      );
    }

    if (field.type === "select") {
      return (
        <Dropdown
          key={key} label={field.label} required={field.required}
          value={form[key]} placeholder={`Select ${field.label}`}
          options={field.options || []}
          open={dd[key]} onToggle={tog(key)} onChange={set(key)}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <TextArea
          key={key} label={field.label} required={field.required}
          value={form[key]} placeholder={`Enter ${field.label}`}
          onChange={set(key)}
        />
      );
    }

    if (field.type === "file") {
      return <FileUpload key={key} label={field.label} required={field.required} />;
    }

    if (field.type === "date" || field.type === "daterange") {
      return (
        <TextInput
          key={key} label={field.label} required={field.required}
          value={form[key]} placeholder="DD/MM/YYYY"
          onChange={set(key)} type="text"
        />
      );
    }

    return (
      <TextInput
        key={key} label={field.label} required={field.required}
        value={form[key]} placeholder={`Enter ${field.label}`}
        onChange={set(key)} type={field.type === "number" ? "number" : "text"}
      />
    );
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 500, animation: "fadeIn .2s ease-out" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 700,
        background: C.white, zIndex: 600,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        animation: "slideIn .3s ease-out",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <CloseIcon onClick={onClose} />
            <div>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Add Line Items</span>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                {tender.rfqName || "Untitled"} &middot; {vendorType}
                {tender.mode && ` &middot; ${tender.mode}`}
                {tender.type && ` &middot; ${tender.type}`}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {previewCount > 0 && (
              <span style={{
                padding: "4px 12px", borderRadius: 14, fontSize: 12,
                background: C.liveBg, color: C.liveGreen, fontWeight: 600,
              }}>
                {previewCount} line item{previewCount > 1 ? "s" : ""} will be created
              </span>
            )}
            <button onClick={handleSave} style={{
              padding: "9px 28px", borderRadius: 6, border: "none",
              background: C.submitBlue, color: C.white, fontSize: 14,
              fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(26,115,232,0.3)",
            }}>Save</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Creation logic hint */}
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "#e3f2fd", marginBottom: 20,
            fontSize: 12.5, color: C.primary, fontWeight: 500,
          }}>
            Line items created by: <strong>{config.creationLogic}</strong>
          </div>

          {config.sections.map((section) => (
            <div key={section.title} style={{ marginBottom: 8 }}>
              <SectionHeader
                title={section.title}
                collapsed={collapsed[section.title]}
                onToggle={() => setCollapsed((p) => ({ ...p, [section.title]: !p[section.title] }))}
              />
              {!collapsed[section.title] && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18, marginBottom: 16,
                }}>
                  {section.fields.map((field) => {
                    const rendered = renderField(field);
                    if (!rendered) return null;
                    // Full width for textarea, file, multiselect
                    const fullWidth = field.type === "textarea" || field.type === "file" ||
                      (field.type === "multiselect" && config.sections.length === 1);
                    return (
                      <div key={field.key} style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
                        {rendered}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
