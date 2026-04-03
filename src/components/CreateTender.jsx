import React, { useState, useCallback } from "react";
import C from "../config/colors";
import {
  VENDOR_TYPES, MODES, TYPES, getSubTypes, getSegments,
  getSubTypeLabel, showsMode, showsType, getRfqTypeOptions,
  showsInsurance, DOCUMENT_CATEGORIES,
} from "../config/rfqConfig";
import {
  Dropdown, TextInput, CalendarIcon, CloseIcon, UploadIcon, ArrowIcon,
} from "./Common";

export default function CreateTender({ onClose, onSubmit }) {
  const [dd, setDd] = useState({});
  const [form, setForm] = useState({});

  const tog = useCallback((key) => (val) => setDd((p) => ({ ...p, [key]: val })), []);
  const set = (key) => (val) => {
    setForm((p) => {
      const next = { ...p, [key]: val };
      // Reset dependent fields on vendor type change
      if (key === "vendorType") {
        delete next.mode; delete next.type; delete next.subType; delete next.segment;
        delete next.rfqType;
      }
      if (key === "mode") { delete next.type; delete next.subType; }
      if (key === "type") { delete next.subType; delete next.segment; }
      return next;
    });
  };

  const vendorType = form.vendorType;
  const modeOptions = vendorType ? MODES[vendorType] : null;
  const typeOptions = vendorType ? TYPES[vendorType] : null;
  const subTypeOptions = getSubTypes(vendorType, form.mode, form.type);
  const segmentOptions = getSegments(vendorType, form.type);
  const subTypeLabel = getSubTypeLabel(vendorType, form.mode, form.type);
  const rfqTypeOptions = vendorType ? getRfqTypeOptions(vendorType) : [];
  const showIns = showsInsurance(vendorType);

  // Determine if all cascading main fields are complete → then show standard fields
  const mainFieldsComplete = (() => {
    if (!vendorType) return false;
    if (vendorType === "Transporter") return false;
    // Need mode if vendor has modes
    if (modeOptions && !form.mode) return false;
    // Need type if vendor has types
    if (typeOptions && !form.type) return false;
    // Need sub type if sub type options exist for this combo
    if (subTypeOptions && !form.subType) return false;
    // Need segment if segment options exist (CFS + Import)
    if (segmentOptions && !form.segment) return false;
    return true;
  })();

  const handleSubmit = () => {
    if (!vendorType) return alert("Please select Vendor Type");
    onSubmit(form);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: C.overlay, zIndex: 500,
        animation: "fadeIn .2s ease-out",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 640,
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
            <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Create Tender</span>
          </div>
          <button onClick={handleSubmit} style={{
            padding: "9px 28px", borderRadius: 6, border: "none",
            background: C.submitBlue, color: C.white, fontSize: 14,
            fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(26,115,232,0.3)",
          }}>Submit</button>
        </div>

        {/* Scrollable body — progressive disclosure: each field appears only after previous is filled */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>

          {/* ── Row 1: Vendor Type | Mode (right side, appears after vendor selected) ── */}
          <div style={{ display: "grid", gridTemplateColumns: vendorType && modeOptions ? "1fr 1fr" : "1fr", gap: 18, marginBottom: 22 }}>
            <Dropdown
              label="Vendor Type" required value={form.vendorType}
              placeholder="Select Vendor Type" options={VENDOR_TYPES}
              open={dd.vendorType} onToggle={tog("vendorType")} onChange={set("vendorType")}
            />
            {vendorType && modeOptions && (
              <div style={{ animation: "fadeSlideIn 0.2s ease-out" }}>
                <Dropdown
                  label="Mode" required value={form.mode}
                  placeholder="Select Mode" options={modeOptions}
                  open={dd.mode} onToggle={tog("mode")} onChange={set("mode")}
                />
              </div>
            )}
          </div>

          {/* ── Row 2: Type | Sub Type (appears after mode filled or directly for non-mode vendors) ── */}
          {vendorType && typeOptions && (!modeOptions || form.mode) && (
            <div style={{
              display: "grid",
              gridTemplateColumns: (form.type && subTypeOptions) ? "1fr 1fr" : "1fr",
              gap: 18, marginBottom: 22, animation: "fadeSlideIn 0.2s ease-out",
            }}>
              <Dropdown
                label="Type" required value={form.type}
                placeholder="Select Type" options={typeOptions}
                open={dd.type} onToggle={tog("type")} onChange={set("type")}
              />
              {form.type && subTypeOptions && (
                <div style={{ animation: "fadeSlideIn 0.2s ease-out" }}>
                  <Dropdown
                    label={subTypeLabel} required value={form.subType}
                    placeholder="Select Sub Type" options={subTypeOptions}
                    open={dd.subType} onToggle={tog("subType")} onChange={set("subType")}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Row 3: Segment (only for CFS + Import, appears after type filled) ── */}
          {form.type && segmentOptions && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22, animation: "fadeSlideIn 0.2s ease-out" }}>
              <Dropdown
                label="Segment" required value={form.segment}
                placeholder="Select Segment" options={segmentOptions}
                open={dd.segment} onToggle={tog("segment")} onChange={set("segment")}
              />
              <div /> {/* empty right cell */}
            </div>
          )}

          {/* ── Standard Fields: shown only when ALL cascading fields are complete ── */}
          {mainFieldsComplete && (
            <>
              {/* Divider */}
              <div style={{ height: 1, background: C.border, margin: "8px 0 22px", animation: "fadeSlideIn 0.2s ease-out" }} />

              {/* Preparation Date | Start & End Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22, animation: "fadeSlideIn 0.2s ease-out" }}>
                <TextInput label="Preparation Date" required value={form.prepDate} onChange={set("prepDate")} placeholder="DD/MM/YYYY" icon={<CalendarIcon />} />
                <div>
                  <div style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Start & End Date</span>
                    <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center" }}>
                      <input type="text" value={form.startDate || ""} onChange={(e) => set("startDate")(e.target.value)} placeholder="Start date" style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: form.startDate ? C.text : C.placeholder, background: "transparent" }} />
                    </div>
                    <span style={{ color: C.textMuted }}>~</span>
                    <div style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center" }}>
                      <input type="text" value={form.endDate || ""} onChange={(e) => set("endDate")(e.target.value)} placeholder="End date" style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: form.endDate ? C.text : C.placeholder, background: "transparent" }} />
                      <CalendarIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* RFQ Name | RFQ Type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
                <TextInput label="RFQ Name" required value={form.rfqName} onChange={set("rfqName")} placeholder="Enter Name" />
                <Dropdown
                  label="RFQ Type" required value={form.rfqType}
                  placeholder="Select RFQ Type" options={rfqTypeOptions}
                  open={dd.rfqType} onToggle={tog("rfqType")} onChange={set("rfqType")}
                />
              </div>

              {/* Business Unit | Sub Business Unit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
                <Dropdown label="Business Unit" value={form.businessUnit} placeholder="Select Business Unit"
                  options={["Petchem", "Jio", "Retail", "O2C", "New Energy"]}
                  open={dd.businessUnit} onToggle={tog("businessUnit")} onChange={set("businessUnit")} />
                <Dropdown label="Sub Business Unit" value={form.subBusinessUnit} placeholder="Select Sub Business ..."
                  options={["Sub Unit A", "Sub Unit B", "Sub Unit C"]}
                  open={dd.subBusinessUnit} onToggle={tog("subBusinessUnit")} onChange={set("subBusinessUnit")} />
              </div>

              {/* Insurance (FF / SL only) */}
              {showIns && (
                <div style={{ marginBottom: 22, maxWidth: 280 }}>
                  <Dropdown label="Insurance Required" required value={form.insurance} placeholder="Insurance Required"
                    options={["Yes", "No"]}
                    open={dd.insurance} onToggle={tog("insurance")} onChange={set("insurance")} />
                </div>
              )}

              {/* Documents */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.label, marginBottom: 8 }}>Documents</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Dropdown value={form.docCategory} placeholder="Select Attac..."
                    options={DOCUMENT_CATEGORIES} width={160}
                    open={dd.docCategory} onToggle={tog("docCategory")} onChange={set("docCategory")} />
                  <button style={{
                    height: 38, padding: "0 16px", borderRadius: 6,
                    border: `1px solid ${C.border}`, background: C.white,
                    fontSize: 13, color: C.textSec, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <UploadIcon /> Upload
                  </button>
                </div>
                <div style={{ marginTop: 10, color: C.link, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>+ Add More</div>
              </div>

              {/* Terms & Conditions */}
              <div style={{
                padding: "14px 0", borderTop: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              }}>
                <ArrowIcon />
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Terms & Conditions</span>
              </div>
            </>
          )}

          {/* Transporter message */}
          {vendorType === "Transporter" && (
            <div style={{
              padding: 24, background: "#fff8e1", borderRadius: 8,
              border: "1px solid #ffe082", marginTop: 12,
            }}>
              <span style={{ fontSize: 13.5, color: "#f57f17", fontWeight: 500 }}>
                For Transporter, the procurement process happens outside Shipsy platform.
                Rates would flow to Shipsy via integration.
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
