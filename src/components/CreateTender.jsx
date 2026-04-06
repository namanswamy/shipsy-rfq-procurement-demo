import React, { useState, useCallback } from "react";
import C from "../config/colors";
import {
  VENDOR_TYPES, MODES, TYPES, getSubTypes, getSegments,
  getSubTypeLabel, showsMode, showsType, getRfqTypeOptions,
  showsInsurance, DOCUMENT_CATEGORIES,
} from "../config/rfqConfig";
import {
  Dropdown, TextInput, CalendarIcon, CloseIcon, UploadIcon,
} from "./Common";

export default function CreateTender({ onClose, onSubmit }) {
  const [openDd, setOpenDd] = useState(null); // only ONE dropdown open at a time
  const [form, setForm] = useState({});
  const [docRows, setDocRows] = useState([{ id: 1, category: "", file: null }]);
  const [tncRows, setTncRows] = useState([]);
  const [tncOpen, setTncOpen] = useState(false);

  // Toggle dropdown — closes any other open dropdown
  const tog = useCallback((key) => (val) => {
    setOpenDd(val ? key : null);
  }, []);

  const set = (key) => (val) => {
    setForm((p) => {
      const next = { ...p, [key]: val };
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

  const mainFieldsComplete = (() => {
    if (!vendorType) return false;
    if (vendorType === "Transporter") return false;
    if (modeOptions && !form.mode) return false;
    if (typeOptions && !form.type) return false;
    if (subTypeOptions && !form.subType) return false;
    if (segmentOptions && !form.segment) return false;
    return true;
  })();

  const handleSubmit = () => {
    if (!vendorType) return alert("Please select Vendor Type");
    onSubmit(form);
  };

  /* ─── Document row helpers ─── */
  const addDocRow = () => setDocRows((p) => [...p, { id: Date.now(), category: "", file: null }]);
  const removeDocRow = (id) => setDocRows((p) => p.length > 1 ? p.filter((r) => r.id !== id) : p);
  const setDocCategory = (id, val) => setDocRows((p) => p.map((r) => r.id === id ? { ...r, category: val } : r));

  /* ─── T&C row helpers ─── */
  const addTncRow = () => setTncRows((p) => [...p, { id: Date.now(), text: "", mandatory: false, remarks: true }]);
  const removeTncRow = (id) => setTncRows((p) => p.filter((r) => r.id !== id));
  const updateTnc = (id, field, val) => setTncRows((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));

  /* ─── Toggle switch component ─── */
  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{
      width: 36, height: 20, borderRadius: 10, cursor: "pointer",
      background: value ? "#1890FF" : "#d9d9d9", transition: "background 0.2s",
      display: "flex", alignItems: "center", padding: 2, flexShrink: 0,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: 8, background: "#fff",
        transition: "transform 0.2s", transform: value ? "translateX(16px)" : "translateX(0)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: C.overlay, zIndex: 500,
        animation: "fadeIn .2s ease-out",
      }} />
      <div onClick={() => setOpenDd(null)} style={{
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

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>

          {/* ── Row 1: Vendor Type | Mode ── */}
          <div style={{ display: "grid", gridTemplateColumns: vendorType && modeOptions ? "1fr 1fr" : "1fr", gap: 18, marginBottom: 22 }}>
            <Dropdown label="Vendor Type" required value={form.vendorType}
              placeholder="Select Vendor Type" options={VENDOR_TYPES}
              open={openDd === "vendorType"} onToggle={tog("vendorType")} onChange={set("vendorType")} />
            {vendorType && modeOptions && (
              <div style={{ animation: "fadeSlideIn 0.2s ease-out" }}>
                <Dropdown label="Mode" required value={form.mode}
                  placeholder="Select Mode" options={modeOptions}
                  open={openDd === "mode"} onToggle={tog("mode")} onChange={set("mode")} />
              </div>
            )}
          </div>

          {/* ── Row 2: Type | Sub Type ── */}
          {vendorType && typeOptions && (!modeOptions || form.mode) && (
            <div style={{
              display: "grid",
              gridTemplateColumns: (form.type && subTypeOptions) ? "1fr 1fr" : "1fr",
              gap: 18, marginBottom: 22, animation: "fadeSlideIn 0.2s ease-out",
            }}>
              <Dropdown label="Type" required value={form.type}
                placeholder="Select Type" options={typeOptions}
                open={openDd === "type"} onToggle={tog("type")} onChange={set("type")} />
              {form.type && subTypeOptions && (
                <div style={{ animation: "fadeSlideIn 0.2s ease-out" }}>
                  <Dropdown label={subTypeLabel} required value={form.subType}
                    placeholder="Select Sub Type" options={subTypeOptions}
                    open={openDd === "subType"} onToggle={tog("subType")} onChange={set("subType")} />
                </div>
              )}
            </div>
          )}

          {/* ── Row 3: Segment ── */}
          {form.type && segmentOptions && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22, animation: "fadeSlideIn 0.2s ease-out" }}>
              <Dropdown label="Segment" required value={form.segment}
                placeholder="Select Segment" options={segmentOptions}
                open={openDd === "segment"} onToggle={tog("segment")} onChange={set("segment")} />
              <div />
            </div>
          )}

          {/* ── Standard Fields ── */}
          {mainFieldsComplete && (
            <>
              <div style={{ height: 1, background: C.border, margin: "8px 0 22px" }} />

              {/* Preparation Date | Start & End Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
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
                <Dropdown label="RFQ Type" required value={form.rfqType}
                  placeholder="Select RFQ Type" options={rfqTypeOptions}
                  open={openDd === "rfqType"} onToggle={tog("rfqType")} onChange={set("rfqType")} />
              </div>

              {/* Business Unit | Sub Business Unit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
                <Dropdown label="Business Unit" value={form.businessUnit} placeholder="Select Business Unit"
                  options={["Petchem", "Jio", "Retail", "O2C", "New Energy"]}
                  open={openDd === "businessUnit"} onToggle={tog("businessUnit")} onChange={set("businessUnit")} />
                <Dropdown label="Sub Business Unit" value={form.subBusinessUnit} placeholder="Select Sub Business ..."
                  options={["RBL", "JPL", "RJIL", "RPPMSL", "CAPEX", "DIGITAL", "UL", "GROCERY", "OTHER"]}
                  open={openDd === "subBusinessUnit"} onToggle={tog("subBusinessUnit")} onChange={set("subBusinessUnit")} />
              </div>

              {/* Insurance (FF / SL only) */}
              {showIns && (
                <div style={{ marginBottom: 22, maxWidth: 280 }}>
                  <Dropdown label="Insurance Required" required value={form.insurance} placeholder="Insurance Required"
                    options={["Yes", "No"]}
                    open={openDd === "insurance"} onToggle={tog("insurance")} onChange={set("insurance")} />
                </div>
              )}

              {/* ─── Documents section ─── */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.label, marginBottom: 8 }}>Documents</div>
                {docRows.map((row, idx) => (
                  <div key={row.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <Dropdown value={row.category} placeholder="Select Attac..."
                      options={DOCUMENT_CATEGORIES} width={180}
                      open={openDd === `doc_${row.id}`} onToggle={tog(`doc_${row.id}`)}
                      onChange={(val) => setDocCategory(row.id, val)} />
                    <button style={{
                      height: 38, padding: "0 16px", borderRadius: 6,
                      border: `1px solid ${C.border}`, background: C.white,
                      fontSize: 13, color: C.textSec, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                    }}>
                      <UploadIcon /> Upload
                    </button>
                    {docRows.length > 1 && (
                      <div onClick={() => removeDocRow(row.id)} style={{
                        width: 22, height: 22, borderRadius: 11, background: "#fff1f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0, border: "1px solid #ffa39e",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" stroke="#f5222d" strokeWidth="1.5" fill="none">
                          <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                <div onClick={addDocRow} style={{ marginTop: 4, color: "#1890FF", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>+ Add More</div>
              </div>

              {/* ─── Terms & Conditions ─── */}
              <div style={{ borderTop: `1px solid ${C.border}` }}>
                <div onClick={() => setTncOpen(!tncOpen)} style={{
                  padding: "14px 0", display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" stroke="#555" strokeWidth="1.5" fill="none"
                    style={{ transform: tncOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                    <polyline points="4,2 8,6 4,10" />
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Terms & Conditions</span>
                </div>

                {tncOpen && (
                  <div style={{ paddingBottom: 16, animation: "fadeSlideIn 0.2s ease-out" }}>
                    {/* T&C Header */}
                    {tncRows.length > 0 && (
                      <div style={{
                        display: "grid", gridTemplateColumns: "36px 1fr 70px 70px 36px 36px",
                        gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 8,
                      }}>
                        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>S.N.</span>
                        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>Terms & Conditions</span>
                        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500, textAlign: "center" }}>Mandatory</span>
                        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500, textAlign: "center" }}>Remarks</span>
                        <span></span>
                        <span></span>
                      </div>
                    )}

                    {/* T&C Rows */}
                    {tncRows.map((row, idx) => (
                      <div key={row.id} style={{
                        display: "grid", gridTemplateColumns: "36px 1fr 70px 70px 36px 36px",
                        gap: 8, alignItems: "center", marginBottom: 10,
                        padding: "10px 0", background: "#fafaf5", borderRadius: 4,
                      }}>
                        <span style={{ fontSize: 13, color: C.textSec, textAlign: "center", fontWeight: 600 }}>{idx + 1}</span>
                        <textarea value={row.text} onChange={(e) => updateTnc(row.id, "text", e.target.value)}
                          rows={1} style={{
                            width: "100%", padding: "6px 10px", borderRadius: 4,
                            border: `1px solid ${C.border}`, fontSize: 13, color: C.text,
                            resize: "vertical", fontFamily: "inherit", outline: "none",
                            background: C.white,
                          }} />
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Toggle value={row.mandatory} onChange={(v) => updateTnc(row.id, "mandatory", v)} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Toggle value={row.remarks} onChange={(v) => updateTnc(row.id, "remarks", v)} />
                        </div>
                        {/* Upload per row */}
                        <div style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}>
                          <UploadIcon />
                        </div>
                        {/* Delete */}
                        <div onClick={() => removeTncRow(row.id)} style={{
                          width: 20, height: 20, borderRadius: 10, background: "#fff1f0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", border: "1px solid #ffa39e", margin: "0 auto",
                        }}>
                          <svg width="8" height="8" viewBox="0 0 8 8" stroke="#f5222d" strokeWidth="1.5" fill="none">
                            <line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/>
                          </svg>
                        </div>
                      </div>
                    ))}

                    <div onClick={addTncRow} style={{ color: "#1890FF", fontSize: 13, cursor: "pointer", fontWeight: 500, marginTop: 4 }}>+ Add More</div>
                  </div>
                )}
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
