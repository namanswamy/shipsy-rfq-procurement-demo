import React, { useState } from "react";
import C from "./config/colors";
import { VENDOR_CHIP } from "./config/rfqConfig";
import {
  GridIcon, SearchIcon, CalendarIcon,
  StatusBadge, StepCheck, StepEmpty,
} from "./components/Common";
import CreateTender from "./components/CreateTender";
import LineItemCreation from "./components/LineItemCreation";
import ViewLineItems from "./components/ViewLineItems";
import SendRfq from "./components/SendRfq";

/* ─── Seed data: one row per vendor type for demo + original screenshot rows ─── */
const SEED_ROWS = [
  // ── Freight Forwarder (plan_created — click "+ Add Line Items" to test FF form) ──
  { id: 101, name: "FF-FCL-IMPORT-DEMO", vendorType: "Freight Forwarder", mode: "FCL", type: "Import", subType: "Freight Management", tags: "FCL \u2022 Import \u2022 Freight Management", period: "-", dates: "Apr 1, 2026 - Jun 30, 2026", status: "ON TIME", round: "-", items: 0, response: "-", amend: "-", stepper: "plan_created", lineItems: [], rfqName: "FF-FCL-IMPORT-DEMO" },

  // ── Shipping Line (plan_created — click "+ Add Line Items" to test SL form) ──
  { id: 102, name: "SL-FCL-EXPORT-DEMO", vendorType: "Shipping Line", mode: "FCL", type: "Export", subType: "Solid", tags: "FCL \u2022 Export \u2022 Solid", period: "-", dates: "Apr 1, 2026 - Sep 30, 2026", status: "ON TIME", round: "-", items: 0, response: "-", amend: "-", stepper: "plan_created", lineItems: [], rfqName: "SL-FCL-EXPORT-DEMO" },

  // ── CHA (plan_created — click "+ Add Line Items" to test CHA form: POD Group) ──
  { id: 103, name: "CHA-IMPORT-DEMO", vendorType: "CHA", type: "Import", subType: "General Cargo", tags: "ALL \u2022 Import \u2022 General Cargo", chip: "CHA", period: "-", dates: "Apr 1, 2026 - May 31, 2026", status: "ON TIME", round: "-", items: 0, response: "-", amend: "-", stepper: "plan_created", lineItems: [], rfqName: "CHA-IMPORT-DEMO" },

  // ── CFS (plan_created — click "+ Add Line Items" to test CFS form: POD) ──
  { id: 104, name: "CFS-IMPORT-DPD-DEMO", vendorType: "CFS", type: "Import", segment: "DPD-CFS", tags: "ALL \u2022 Import", chip: "CFS", period: "-", dates: "Apr 1, 2026 - Jul 31, 2026", status: "ON TIME", round: "-", items: 0, response: "-", amend: "-", stepper: "plan_created", lineItems: [], rfqName: "CFS-IMPORT-DPD-DEMO" },

  // ── ICD (plan_created — click "+ Add Line Items" to test ICD form: POD) ──
  { id: 105, name: "ICD-IMPORT-DEMO", vendorType: "ICD", type: "Import", tags: "ALL \u2022 Import", chip: "ICD", period: "-", dates: "Apr 1, 2026 - Jun 30, 2026", status: "ON TIME", round: "-", items: 0, response: "-", amend: "-", stepper: "plan_created", lineItems: [], rfqName: "ICD-IMPORT-DEMO" },

  // ── Break Bulk (plan_created — click "+ Add Line Items" to test BB form) ──
  { id: 106, name: "BB-EXPORT-DEMO", vendorType: "Break Bulk Vendor", type: "Export", tags: "ALL \u2022 Export", chip: "BB", period: "-", dates: "Apr 1, 2026 - Dec 31, 2026", status: "ON TIME", round: "-", items: 0, response: "-", amend: "-", stepper: "plan_created", lineItems: [], rfqName: "BB-EXPORT-DEMO" },

  // ── Surveyor (plan_created — click "+ Add Line Items" to test Surveyor form) ──
  { id: 107, name: "SURVEYOR-EXPORT-DEMO", vendorType: "Surveyor", type: "Export", subType: "Marine Warranty", tags: "ALL \u2022 Export \u2022 Marine Warranty", chip: "SUR", period: "-", dates: "Apr 1, 2026 - Oct 31, 2026", status: "ON TIME", round: "-", items: 0, response: "-", amend: "-", stepper: "plan_created", lineItems: [], rfqName: "SURVEYOR-EXPORT-DEMO" },

  // ── Send RFQ ready rows (line items added, click "Send RFQ") ──
  { id: 201, name: "FF-MUMBAI-CHINA-Q2-2026", vendorType: "Freight Forwarder", mode: "FCL", type: "Import", subType: "Ocean Freight", tags: "FCL \u2022 Import \u2022 Ocean Freight", period: "Custom", dates: "Apr 1, 2026 - Jun 30, 2026", status: "ON TIME", round: "-", items: 4, response: "-", amend: "-", stepper: "line_items", stepItems: 4, lineItems: [{ id: 1, pol: "INMUN", pod: "CNSHA", containerSize: "40' GP", incoterm: "FOB" }, { id: 2, pol: "INMUN", pod: "CNNGB", containerSize: "40' GP", incoterm: "FOB" }, { id: 3, pol: "INNSA", pod: "CNSHA", containerSize: "20' GP", incoterm: "CIF" }, { id: 4, pol: "INNSA", pod: "CNNGB", containerSize: "20' GP", incoterm: "CIF" }], rfqName: "FF-MUMBAI-CHINA-Q2-2026" },

  { id: 202, name: "SL-WEST-COAST-EXPORT-2026", vendorType: "Shipping Line", mode: "FCL", type: "Export", subType: "Solid Shipment", tags: "FCL \u2022 Export \u2022 Solid Shipment", period: "Custom", dates: "May 1, 2026 - Aug 31, 2026", status: "ON TIME", round: "-", items: 3, response: "-", amend: "-", stepper: "line_items", stepItems: 3, lineItems: [{ id: 1, pol: "INMUN", pod: "SGSIN", containerSize: "40' HC", incoterm: "FOB" }, { id: 2, pol: "INMUN", pod: "AEJEA", containerSize: "40' HC", incoterm: "FOB" }, { id: 3, pol: "INPAV", pod: "SGSIN", containerSize: "40' HC", incoterm: "CFR" }], rfqName: "SL-WEST-COAST-EXPORT-2026" },

  { id: 203, name: "CHA-IMPORT-GENERAL-CARGO-2026", vendorType: "CHA", type: "Import", subType: "General Cargo", tags: "ALL \u2022 Import \u2022 General Cargo", chip: "CHA", period: "-", dates: "Apr 15, 2026 - Jul 15, 2026", status: "ON TIME", round: "-", items: 3, response: "-", amend: "-", stepper: "line_items", stepItems: 3, lineItems: [{ id: 1, podGroup: "West Coast Group" }, { id: 2, podGroup: "East Coast Group" }, { id: 3, podGroup: "South India Group" }], rfqName: "CHA-IMPORT-GENERAL-CARGO-2026" },

  { id: 204, name: "BB-PROJECT-ALPHA-2026", vendorType: "Break Bulk Vendor", type: "Export", tags: "ALL \u2022 Export", chip: "BB", period: "Custom", dates: "Jun 1, 2026 - Dec 31, 2026", status: "ON TIME", round: "-", items: 2, response: "-", amend: "-", stepper: "line_items", stepItems: 2, lineItems: [{ id: 1, pol: "INMUN", pod: "USLAX", materialPONo: "PO-2026-001", cargoType: "General" }, { id: 2, pol: "INMUN", pod: "GBFXT", materialPONo: "PO-2026-002", cargoType: "Hazardous" }], rfqName: "BB-PROJECT-ALPHA-2026" },

  // ── CFS (line items added — click "View Line Items") ──
  { id: 205, name: "CFS-IMPORT-WEST-COAST-2026", vendorType: "CFS", type: "Import", segment: "DPD-CFS", tags: "ALL \u2022 Import", chip: "CFS", period: "Custom", dates: "Apr 1, 2026 - Aug 31, 2026", status: "ON TIME", round: "-", items: 3, response: "-", amend: "-", stepper: "line_items", stepItems: 3, lineItems: [{ id: 1, pod: "INMUN" }, { id: 2, pod: "INNSA" }, { id: 3, pod: "INPAV" }], rfqName: "CFS-IMPORT-WEST-COAST-2026" },

  // ── ICD (line items added — click "View Line Items") ──
  { id: 206, name: "ICD-IMPORT-NORTH-2026", vendorType: "ICD", type: "Import", tags: "ALL \u2022 Import", chip: "ICD", period: "Custom", dates: "May 1, 2026 - Sep 30, 2026", status: "ON TIME", round: "-", items: 2, response: "-", amend: "-", stepper: "line_items", stepItems: 2, lineItems: [{ id: 1, pod: "INDEL" }, { id: 2, pod: "INKTP" }], rfqName: "ICD-IMPORT-NORTH-2026" },

  // ── Surveyor (line items added — click "View Line Items") ──
  { id: 207, name: "SURVEYOR-MARINE-WARRANTY-2026", vendorType: "Surveyor", type: "Export", subType: "Marine Warranty", tags: "ALL \u2022 Export \u2022 Marine Warranty", chip: "SUR", period: "Custom", dates: "Jun 1, 2026 - Nov 30, 2026", status: "ON TIME", round: "-", items: 4, response: "-", amend: "-", stepper: "line_items", stepItems: 4, lineItems: [{ id: 1, pol: "INMUN", pod: "CNSHA", projectName: "Project Alpha" }, { id: 2, pol: "INMUN", pod: "SGSIN", projectName: "Project Alpha" }, { id: 3, pol: "INNSA", pod: "CNSHA", projectName: "Project Alpha" }, { id: 4, pol: "INNSA", pod: "SGSIN", projectName: "Project Alpha" }], rfqName: "SURVEYOR-MARINE-WARRANTY-2026" },

  // ── Original screenshot rows ──
  { id: 1, name: "SAP FINAL FM-FCL IMPORT FF REGION TEST-...", vendorType: "Freight Forwarder", mode: "FCL", type: "Import", subType: "Freight Management", tags: "FCL \u2022 Import \u2022 Freight Management", period: "Custom", dates: "Apr 1, 2026 - Jun 30, 2027", status: "LIVE", round: "1", roundDate: "Apr 30, 2026", items: 1, response: "2/2", amend: "-", progress: 0.7, pColor: C.progressBlue, updates: "4 New Updates", lineItems: [{ id: 1, pol: "INMUN", pod: "CNSHA", containerSize: "40' GP", incoterm: "FOB" }], rfqName: "SAP FINAL FM-FCL" },

  { id: 3, name: "FINAL SAP LI", vendorType: "Freight Forwarder", mode: "FCL", tags: "FCL \u2022 Charges \u2022", period: "-", dates: "Mar 25, 2026 - Mar 31, 2526", status: "CLOSED", round: "-", items: 2, response: "2/2", amend: "-", progress: 1, pColor: C.progressGreen, updates: "3 New Updates", lineItems: [{ id: 1, pol: "INMUN", pod: "CNSHA", containerSize: "20' GP", incoterm: "FOB" }, { id: 2, pol: "INNSA", pod: "SGSIN", containerSize: "40' HC", incoterm: "CIF" }], rfqName: "FINAL SAP LI" },
  { id: 4, name: "FINAL SAP FF-FCL IMPORT FF ...", vendorType: "Freight Forwarder", mode: "FCL", type: "Import", subType: "Freight Management", tags: "FCL \u2022 Import \u2022 Freight Management", period: "Custom", dates: "Jan 1, 2026 - Jun 30, 2026", status: "LIVE", round: "1", roundDate: "Apr 30, 2026", items: 1, response: "2/2", amend: "-", progress: 1, pColor: C.progressGreen, updates: "5 New Updates", lineItems: [{ id: 1, pol: "INMUN", pod: "CNSHA", containerSize: "40' GP", incoterm: "FOB" }], rfqName: "FINAL SAP FF-FCL" },
  { id: 5, name: "FINAL SAP OF-DELHI-CUSTOM-2026", vendorType: "Freight Forwarder", mode: "FCL", type: "Import", subType: "Ocean Freight", tags: "FCL \u2022 Import \u2022 Ocean Freight", period: "Custom", dates: "Mar 20, 2026 - Jun 30, 2027", status: "LIVE", round: "1", roundDate: "Apr 30, 2026", items: 1, response: "1/1", amend: "-", progress: 1, pColor: C.progressGreen, updates: "4 New Updates", lineItems: [{ id: 1, pol: "INDEL", pod: "AEJEA", containerSize: "20' GP", incoterm: "CFR" }], rfqName: "FINAL SAP OF-DELHI" },
];

const TABS = [
  { label: "All", count: 308 }, { label: "Live", count: 10 }, { label: "Delayed", count: 36 },
  { label: "Finalised", count: 11 }, { label: "Open", count: 10 }, { label: "Closed", count: 241 },
];

const MODE_CHIPS = ["FCL", "LCL", "AIR", "BB", "ALL"];

export default function App() {
  const [rows, setRows] = useState(SEED_ROWS);
  const [activeTab, setActiveTab] = useState("All");
  const [activeMode, setActiveMode] = useState(null);

  // Panels
  const [showCreate, setShowCreate] = useState(false);
  const [lineItemTarget, setLineItemTarget] = useState(null);
  const [viewItemsTarget, setViewItemsTarget] = useState(null);
  const [sendRfqTarget, setSendRfqTarget] = useState(null);

  const handleCreateSubmit = (form) => {
    const vt = form.vendorType;
    const chip = VENDOR_CHIP[vt];
    const modeTag = form.mode || "ALL";
    const typeTag = form.type || "";
    const subTag = form.subType || "";
    const tags = [modeTag, typeTag, subTag].filter(Boolean).join(" \u2022 ");

    const newRow = {
      id: Date.now(),
      name: form.rfqName || "New RFQ",
      vendorType: vt,
      mode: form.mode,
      type: form.type,
      subType: form.subType,
      segment: form.segment,
      rfqType: form.rfqType,
      tags,
      chip: !form.mode ? chip : undefined,
      period: "-",
      dates: `${form.startDate || "TBD"} - ${form.endDate || "TBD"}`,
      status: "ON TIME",
      round: "-",
      items: 0,
      response: "-",
      amend: "-",
      stepper: "plan_created",
      lineItems: [],
      rfqName: form.rfqName || "New RFQ",
    };
    setRows((p) => [newRow, ...p]);
    setShowCreate(false);
  };

  const handleLineItemSave = (items) => {
    const id = lineItemTarget;
    setRows((p) => p.map((r) => {
      if (r.id !== id) return r;
      return {
        ...r,
        lineItems: items,
        items: items.length,
        stepper: items.length > 0 ? "line_items" : "plan_created",
        stepItems: items.length,
      };
    }));
    setLineItemTarget(null);
  };

  const handleSendRfq = (selectedItems, selectedVendors) => {
    const id = sendRfqTarget;
    setRows((p) => p.map((r) => {
      if (r.id !== id) return r;
      return {
        ...r,
        status: "LIVE",
        round: "1",
        roundDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        response: `0/${selectedVendors.length}`,
        stepper: undefined,
        progress: 0.3,
        pColor: C.progressBlue,
      };
    }));
    setSendRfqTarget(null);
    setViewItemsTarget(null);
  };

  const targetRow = (id) => rows.find((r) => r.id === id);

  /* Mode chip icons — matching the actual Shipsy UI */
  const modeIcon = (m) => {
    const s = { width: 15, height: 15, marginRight: 3, flexShrink: 0 };
    // FCL: shipping container icon (rectangle with vertical lines)
    if (m === "FCL") return <svg style={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1"><rect x="1" y="4" width="14" height="9" rx="1.5"/><line x1="4" y1="4" x2="4" y2="13"/><line x1="8" y1="4" x2="8" y2="13"/><line x1="12" y1="4" x2="12" y2="13"/><line x1="1" y1="7" x2="15" y2="7"/></svg>;
    // LCL: open box / package icon
    if (m === "LCL") return <svg style={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1"><circle cx="8" cy="8" r="5.5"/><ellipse cx="8" cy="8" rx="2.5" ry="5.5"/><line x1="2.5" y1="8" x2="13.5" y2="8"/></svg>;
    // AIR: airplane icon
    if (m === "AIR") return <svg style={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1"><path d="M8 1.5L6.5 5H2L1 7l5 1 1.5 6h1L9 8l5-1-1-2h-4.5L8 1.5z"/></svg>;
    // BB: square with X inside
    if (m === "BB") return <svg style={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>;
    return null;
  };

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", background: C.bgPage, minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn     { from { transform:translateX(100%); }           to { transform:translateX(0); } }
        @keyframes fadeIn      { from { opacity:0; }                            to { opacity:1; } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ═══ Full-screen View Line Items (replaces listing) ═══ */}
      {viewItemsTarget && targetRow(viewItemsTarget) ? (
        <ViewLineItems
          tender={targetRow(viewItemsTarget)}
          lineItems={targetRow(viewItemsTarget).lineItems || []}
          onClose={() => setViewItemsTarget(null)}
          onSendRfq={() => setSendRfqTarget(viewItemsTarget)}
          onAddLineItem={() => setLineItemTarget(viewItemsTarget)}
        />
      ) : (
      <>
      {/* ───── TOP BAR ───── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GridIcon />
          <span style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Manage RFQ</span>
          <span style={{ fontSize: 10, color: C.textSec, fontWeight: 100, whiteSpace: "nowrap" }}>Plan Creation Period</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, border: `1px solid ${C.border}`, fontSize: 13, color: C.text }}>
            <span style={{ fontWeight: 400 }}>02/04/2025</span>
            <span style={{ color: C.textMuted }}>~</span>
            <span style={{ fontWeight: 400 }}>02/04/2026</span>
            <CalendarIcon />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Bell with 99+ */}
          <div style={{ position: "relative", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.textLight} strokeWidth="1.4"><path d="M10 2.5a4.5 4.5 0 00-4.5 4.5v3L4 12h12l-1.5-2V7A4.5 4.5 0 0010 2.5z"/><path d="M8.5 14a1.5 1.5 0 003 0"/></svg>
            <span style={{ position: "absolute", top: -6, right: -10, background: "#f5222d", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 8, lineHeight: "13px", minWidth: 18, textAlign: "center" }}>99+</span>
          </div>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: "#7c4dff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>P</span>
            </div>
            <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="3,4 5,6 7,4" fill="none" stroke={C.textMuted} strokeWidth="1.2"/></svg>
          </div>
        </div>
      </div>

      {/* ───── ROW 2: Mode | Type | Sort By | More Filters ... Search Download Analytics Create ───── */}
      {/* ───── TOOLBAR ───── */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", background: C.white, marginBottom: 6 }}>
        {/* Mode label + chips */}
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 400, marginRight: 8 }}>Mode</span>
        {MODE_CHIPS.map((m) => (
          <span key={m} onClick={() => setActiveMode(m)} style={{
            padding: "3px 10px", borderRadius: 14, fontSize: 11, fontWeight: 500,
            border: `1px solid ${activeMode === m ? C.primary : C.borderMed}`,
            background: activeMode === m ? "#e6f7ff" : C.white,
            color: activeMode === m ? C.primary : C.textMed, cursor: "pointer",
            display: "inline-flex", alignItems: "center", height: 28, marginRight: 5,
          }}>{modeIcon(m)}{m}</span>
        ))}

        {/* Type chips: only show when a mode is selected */}
        {activeMode && (
          <>
            <div style={{ width: 1, height: 20, background: C.borderMed, margin: "0 10px" }} />
            <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 400, marginRight: 8 }}>Type</span>
            {["Export", "Import", "Charges"].map((t) => (
              <span key={t} style={{
                padding: "3px 10px", borderRadius: 14, fontSize: 11, fontWeight: 500,
                border: `1px solid ${C.borderMed}`, background: C.white,
                color: C.textMed, cursor: "pointer",
                display: "inline-flex", alignItems: "center", height: 28, marginRight: 5,
              }}>{t}</span>
            ))}
          </>
        )}

        {/* Vertical separator */}
        <div style={{ width: 1, height: 20, background: C.borderMed, margin: "0 10px" }} />

        {/* Sort By */}
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 400, marginRight: 6 }}>Sort By</span>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 12px", borderRadius: 16, border: `1px solid ${C.borderMed}`,
          fontSize: 12, color: C.placeholder, cursor: "pointer", height: 28, minWidth: 100,
        }}>
          <span>Select</span>
          <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="3,4 5,6 7,4" fill="none" stroke={C.textMuted} strokeWidth="1.5"/></svg>
        </div>

        {/* Funnel icon + More Filters */}
        <span style={{ fontSize: 11, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginLeft: 14, fontWeight: 500 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={C.textMuted} strokeWidth="1.3"><path d="M1.5 2.5h11L8.5 7v4l-3 1.5V7L1.5 2.5z"/></svg>
          More Filters
        </span>
        <span style={{ fontSize: 11, color: C.red, cursor: "pointer", marginLeft: 8, fontWeight: 400 }}>Reset</span>

        {/* Right side: Search + Download + Analytics + Create */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ cursor: "pointer" }}><SearchIcon /></div>
          <div style={{ cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke={C.textMuted} strokeWidth="1.5"><line x1="9" y1="3" x2="9" y2="12"/><polyline points="5,9 9,13 13,9"/><line x1="3" y1="16" x2="15" y2="16"/></svg>
          </div>
          <button style={{ padding: "0 14px", borderRadius: 4, border: "1px solid #333", background: C.white, fontSize: 13, fontWeight: 400, color: C.text, cursor: "pointer", height: 30, lineHeight: "28px" }}>Analytics</button>
          <button onClick={() => setShowCreate(true)} style={{ padding: "0 14px", borderRadius: 4, border: "1px solid #096dd9", background: "#096dd9", color: C.white, fontSize: 13, fontWeight: 400, cursor: "pointer", height: 30, lineHeight: "28px" }}>Create RFQ Plan</button>
        </div>
      </div>

      {/* ───── Dashboard content ───── */}
      <div style={{ padding: "0 16px" }}>

        {/* ── Layer 1: Tabs + Pagination (separate white card) ── */}
        {/* ── Tabs + Pagination ── */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6, padding: "0" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${TABS.length}, 130px)`, height: 34 }}>
            {TABS.map((t, i) => {
              const isActive = activeTab === t.label;
              return (
                <div key={t.label} onClick={() => setActiveTab(t.label)} style={{
                  cursor: "pointer",
                  border: `1px solid ${C.border}`,
                  borderRight: i < TABS.length - 1 ? "none" : `1px solid ${C.border}`,
                  borderBottom: isActive ? "3px solid #1890FF" : "3px solid transparent",
                  background: C.white,
                  color: isActive ? C.text : C.textLight,
                  fontSize: 14, fontWeight: 400,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0 14px",
                }}>
                  <span>{t.label}</span>
                  <span style={{ fontWeight: 700, color: isActive ? C.text : C.textLight }}>{t.count}</span>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textMuted }}>
            <span style={{ cursor: "pointer", userSelect: "none" }}>K</span>
            <span style={{ cursor: "pointer", userSelect: "none" }}>&lt;</span>
            <span style={{ fontWeight: 600, color: C.text, margin: "0 2px" }}>1</span>
            <span style={{ cursor: "pointer", userSelect: "none" }}>&gt;</span>
            <span style={{ marginLeft: 8, border: `1px solid ${C.borderMed}`, borderRadius: 4, padding: "2px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}>
              10 / page<svg width="8" height="8" viewBox="0 0 8 8" style={{ marginLeft: 2 }}><polyline points="2,3 4,5.5 6,3" fill="none" stroke={C.textMuted} strokeWidth="1.2"/></svg>
            </span>
          </div>
        </div>

        {/* ── Layer 2: Table header (separate card) ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "14% 12% 7% 8% 8% 8% 7% 36%",
          padding: "8px 16px", background: C.headerBg,
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 12, color: C.textLight }}>Plan Name</span>
          <span style={{ fontSize: 12, color: C.textLight }}>Quotation Period</span>
          <span style={{ fontSize: 12, color: C.textLight, textAlign: "center" }}>Status</span>
          <span style={{ fontSize: 12, color: C.textLight }}>Current Round</span>
          <span style={{ fontSize: 12, color: C.textLight, textAlign: "center" }}>Total Line Items</span>
          <span style={{ fontSize: 12, color: C.textLight, textAlign: "center" }}>Response Rate</span>
          <span style={{ fontSize: 12, color: C.textLight, textAlign: "center" }}>Amendments</span>
          <span></span>
        </div>

        {/* ── Layer 3: Each row is a separate white card ── */}
        {rows.map((r) => (
          <div key={r.id}
            onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
            onMouseLeave={(e) => e.currentTarget.style.background = C.white}
            style={{
              display: "grid",
              gridTemplateColumns: "14% 12% 7% 8% 8% 8% 7% 36%",
              padding: "10px 16px", marginBottom: 6,
              background: C.white, borderRadius: 4,
              alignItems: "center", position: "relative",
            }}
          >
            {/* Plan Name */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
              <div style={{ display: "grid" }}>
                <small style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 2 }}>
                  {r.mode && <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke={C.textMuted} strokeWidth="1"><rect x="1" y="3.5" width="12" height="8" rx="1"/><line x1="4" y1="3.5" x2="4" y2="11.5"/><line x1="7" y1="3.5" x2="7" y2="11.5"/><line x1="10" y1="3.5" x2="10" y2="11.5"/></svg>}
                  <span>{r.tags}</span>
                </small>
              </div>
              {r.chip && (
                <small style={{
                  display: "inline-block", marginTop: 3, padding: "0px 6px",
                  borderRadius: 2, fontSize: 10, fontWeight: 600,
                  background: C.chipCyanBg, color: C.chipCyan,
                }}>{r.chip}</small>
              )}
            </div>

            {/* Quotation Period */}
            <div>
              <div style={{ fontSize: 13, fontWeight: r.period !== "-" ? 700 : 400, color: C.text }}>{r.period}</div>
              <small style={{ fontSize: 11, color: C.textMuted }}>{r.dates}</small>
            </div>

            {/* Status */}
            <div style={{ textAlign: "center" }}><StatusBadge status={r.status} /></div>

            {/* Current Round */}
            <div>
              <div style={{ fontWeight: 700, color: C.text }}>{r.round}</div>
              {r.roundDate && <small style={{ fontSize: 11, color: C.textMuted }}>{r.roundDate}</small>}
            </div>

            {/* Total Line Items */}
            <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: C.text }}>{r.items}</div>

            {/* Response Rate */}
            <div style={{ textAlign: "center", fontSize: 14 }}>
              {r.response !== "-" ? (
                <span>
                  <span style={{ fontWeight: 700 }}>{r.response.split("/")[0]}</span>
                  <span style={{ marginLeft: 2, fontSize: 10, fontWeight: 100 }}>/{r.response.split("/")[1]}</span>
                </span>
              ) : <span>-</span>}
            </div>

            {/* Amendments */}
            <div style={{ textAlign: "center", fontWeight: 700 }}>{r.amend}</div>

            {/* Stepper / Progress (rfqPlanCardStepsContainer) */}
            <div>
              {/* Progress bar for sent RFQs */}
              {r.progress !== undefined && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 0, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${r.progress * 100}%`, background: C.barConfirmed }} />
                    {r.progress < 1 && <div style={{ width: `${(1 - r.progress) * 100}%`, background: C.barRfqNotSent }} />}
                  </div>
                </div>
              )}
              {r.updates && (
                <div style={{ position: "absolute", bottom: 4, right: 16, fontSize: 10, color: "#52c41a", fontWeight: 600, background: "#f6ffed", padding: "1px 6px", borderRadius: 2 }}>{r.updates}</div>
              )}

              {/* Stepper: line_items state */}
              {r.stepper === "line_items" && (
                <div style={{ fontSize: 12 }}>
                  {/* Row 1: circles + lines — all vertically centered */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0, color: C.textDark, fontWeight: 500 }}>
                      <StepCheck /> Plan Created
                    </div>
                    <div style={{ flex: 1, height: 2, background: "#46B774", margin: "0 10px", minWidth: 30 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0, color: C.textDark, fontWeight: 500 }}>
                      <StepCheck /> <strong style={{ fontSize: 14 }}>{r.stepItems}</strong> Line Items Added
                    </div>
                    <div style={{ flex: 1, height: 2, background: C.border, margin: "0 10px", minWidth: 30 }} />
                    <div onClick={(e) => { e.stopPropagation(); setSendRfqTarget(r.id); }}
                      style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", cursor: "pointer", color: C.textDark, fontWeight: 500, flexShrink: 0 }}>
                      <StepEmpty color="#1890FF" /> Send RFQ
                    </div>
                  </div>
                  {/* Row 2: links below respective steps */}
                  <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
                    <div style={{ flexShrink: 0, paddingLeft: 22 }}>
                      <span style={{ color: C.primaryDark, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>Edit RFQ Plan</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 20 }} />
                    <div style={{ flexShrink: 0, paddingLeft: 22 }}>
                      <span onClick={(e) => { e.stopPropagation(); setViewItemsTarget(r.id); }}
                        style={{ color: C.primaryDark, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>View Line Items</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 20 }} />
                    <div style={{ flexShrink: 0, width: 90 }} />
                  </div>
                </div>
              )}

              {/* Stepper: plan_created state */}
              {r.stepper === "plan_created" && (
                <div style={{ fontSize: 12 }}>
                  {/* Row 1: circles + lines — all vertically centered */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0, color: C.textDark, fontWeight: 500 }}>
                      <StepCheck /> Plan Created
                    </div>
                    <div style={{ flex: 1, height: 2, background: C.border, margin: "0 10px", minWidth: 30 }} />
                    <div onClick={(e) => { e.stopPropagation(); setLineItemTarget(r.id); }}
                      style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", cursor: "pointer", color: C.primaryDark, fontWeight: 600, flexShrink: 0 }}>
                      <StepEmpty color="#46B774" /> + <span style={{ textDecoration: "underline" }}>Add Line Items</span>
                    </div>
                    <div style={{ flex: 1, height: 2, background: C.border, margin: "0 10px", minWidth: 30 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", color: C.textMuted, fontWeight: 500, flexShrink: 0 }}>
                      <StepEmpty /> Send RFQ
                    </div>
                  </div>
                  {/* Row 2: link below first step */}
                  <div style={{ paddingLeft: 22, marginTop: 2 }}>
                    <span style={{ color: C.primaryDark, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>Edit RFQ Plan</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      </>
      )}

      {/* ───── PANELS (overlays, work on top of either view) ───── */}
      {showCreate && (
        <CreateTender onClose={() => setShowCreate(false)} onSubmit={handleCreateSubmit} />
      )}

      {lineItemTarget && targetRow(lineItemTarget) && (
        <LineItemCreation
          tender={targetRow(lineItemTarget)}
          onClose={() => setLineItemTarget(null)}
          onSave={handleLineItemSave}
        />
      )}

      {sendRfqTarget && targetRow(sendRfqTarget) && (
        <SendRfq
          tender={targetRow(sendRfqTarget)}
          lineItems={targetRow(sendRfqTarget).lineItems || []}
          onClose={() => setSendRfqTarget(null)}
          onSend={handleSendRfq}
        />
      )}
    </div>
  );
}
