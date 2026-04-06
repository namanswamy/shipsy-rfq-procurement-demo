import React, { useState } from "react";
import C from "../config/colors";
import { PORT_DATA, CHARGE_COLUMNS, VENDOR_NAMES } from "../config/rfqConfig";

/* ─── Helpers ─── */
const flagEmoji = (cc) => {
  if (!cc) return "";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => c.charCodeAt(0) + 127397));
};
const getPort = (code) => PORT_DATA[code] || { name: code, country: "", cc: "" };

const SIDEBAR_FILTERS = [
  "All Line Items",
  "To be Finalised",
  "To be Approved",
  "To be Confirmed",
  "Opened for Amendment",
  "Confirmed",
  "No Bids Received in",
  "RFQ not Sent",
];

/* ═══════════════════════════════════════════════════════════════
   ViewLineItems — Full-screen page (replaces listing)
   ═══════════════════════════════════════════════════════════════ */
export default function ViewLineItems({ tender, lineItems, onClose, onSendRfq, onAddLineItem }) {
  const [activeFilter, setActiveFilter] = useState("All Line Items");
  const [checkedItems, setCheckedItems] = useState({});
  const toggleCheck = (id) => setCheckedItems((p) => ({ ...p, [id]: !p[id] }));
  const vendorType = tender.vendorType;
  const rfqType = tender.type; // Export or Import

  /* Charge columns for this vendor + type */
  const chargeColsRaw = CHARGE_COLUMNS[vendorType];
  const chargeCols = Array.isArray(chargeColsRaw)
    ? chargeColsRaw
    : chargeColsRaw?.[rfqType] || chargeColsRaw?.Export || [];

  /* Vendor names for card display */
  const vendorNames = VENDOR_NAMES[vendorType] || ["Unknown Vendor"];

  /* LITM ID generator */
  const getLitmId = (item) => `LITM ${290000 + ((tender.id % 1000) * 100) + item.id}`;

  /* Header subtitle */
  const subtitle = [tender.mode, tender.subType, tender.type ? `Local ${tender.type}` : ""]
    .filter(Boolean)
    .join(" . ");

  /* Start date from tender dates */
  const startDate = tender.dates?.split(" - ")[0] || "—";

  /* Filter counts */
  const filterCounts = {};
  SIDEBAR_FILTERS.forEach((f) => { filterCounts[f] = 0; });
  filterCounts["All Line Items"] = lineItems.length;
  filterCounts["RFQ not Sent"] = lineItems.length;

  /* ─── Flag + Port Name Block (just flag + name, no country — country shown separately) ─── */
  const PortBlock = ({ code, maxW }) => {
    const p = getPort(code);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>{flagEmoji(p.cc)}</span>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 700, color: C.text,
            maxWidth: maxW || 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{p.name.toUpperCase()}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{p.country}</div>
        </div>
      </div>
    );
  };

  /* ─── Single Line Item Card ─── */
  const renderCard = (item, idx) => {
    const vendorName = vendorNames[idx % vendorNames.length];
    const litmId = getLitmId(item);
    const isExport = rfqType === "Export";

    const isChecked = checkedItems[item.id];

    return (
      <div key={item.id} style={{ background: C.white, padding: "12px 0", borderRadius: 4 }}>
        <div style={{ display: "flex", alignItems: "center" }}>

          {/* ── LEFT FIXED: Checkbox + Port + LITM + Badge ── */}
          <div style={{ width: isExport ? 400 : 340, flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 10, padding: "0 12px" }}>
            {/* Checkbox */}
            <div onClick={() => toggleCheck(item.id)} style={{
              width: 16, height: 16, borderRadius: 3, flexShrink: 0, cursor: "pointer", marginTop: 4,
              border: `1.5px solid ${isChecked ? C.primary : C.borderMed}`,
              background: isChecked ? C.primary : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isChecked && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" fill="none" stroke="#fff" strokeWidth="1.5" /></svg>}
            </div>

            {/* Port Info + LITM + Badge — 2-row layout */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Row 1: Port name + LITM */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Port */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                  {vendorType === "CHA" && (
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.podGroup}</div>
                  )}
                  {(vendorType === "CFS" || vendorType === "ICD") && item.pod && <PortBlock code={item.pod} maxW={130} />}
                  {(vendorType === "Freight Forwarder" || vendorType === "Shipping Line" || vendorType === "Break Bulk Vendor" || vendorType === "Surveyor") && (
                    <>
                      {isExport && item.pol ? (
                        <>
                          <PortBlock code={item.pol} maxW={80} />
                          <div style={{ width: 28, borderTop: "2px dashed rgba(0,0,0,0.25)", flexShrink: 0 }} />
                          <PortBlock code={item.pod} maxW={80} />
                        </>
                      ) : (
                        item.pod && <PortBlock code={item.pod} maxW={130} />
                      )}
                    </>
                  )}
                </div>
                {/* LITM + Open badge stacked */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: C.textMuted, whiteSpace: "nowrap" }}>{litmId}</div>
                  <div style={{ marginTop: 3 }}>
                    <span style={{
                      padding: "2px 12px", borderRadius: 10,
                      fontSize: 11, fontWeight: 500,
                      background: C.statusOpen, color: C.textDark,
                    }}>Open</span>
                  </div>
                </div>
              </div>
              {/* Row 3: Container Size / Material PO / Project */}
              {item.containerSize && (
                <div style={{ marginTop: 4, fontSize: 12, color: C.textMuted }}>
                  Container Size <strong style={{ color: C.text }}>{item.containerSize}</strong>
                </div>
              )}
              {item.materialPONo && (
                <div style={{ marginTop: 4, fontSize: 12, color: C.textMuted }}>
                  Material PO <strong style={{ color: C.text }}>{item.materialPONo}</strong>
                  {item.cargoType && <> &middot; Cargo Type <strong style={{ color: C.text }}>{item.cargoType}</strong></>}
                </div>
              )}
              {item.projectName && (
                <div style={{ marginTop: 4, fontSize: 12, color: C.textMuted }}>
                  Project <strong style={{ color: C.text }}>{item.projectName}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Separator — fixed position */}
          <div style={{ width: 1, height: 44, background: C.borderLight, flexShrink: 0 }} />

          {/* ── VENDOR — fixed width ── */}
          <div style={{ width: isExport ? 110 : 130, flexShrink: 0, padding: "0 8px" }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: C.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{vendorName}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{vendorType}</div>
          </div>

          {/* ── MIDDLE SCROLLABLE: Charge Columns ── */}
          <div className="hide-scrollbar" style={{ flex: 1, minWidth: 0, overflowX: "auto", display: "flex", gap: 4, padding: "0 4px" }}>
            {chargeCols.map((col, i) => (
              <div key={i} style={{ minWidth: 100, textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>-</div>
                <div style={{
                  fontSize: 11, color: C.textMuted, lineHeight: 1.3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{col}</div>
              </div>
            ))}
          </div>

          {/* ── RIGHT FIXED: Send RFQ + Kebab ── */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
            <button onClick={onSendRfq} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 4,
              border: `1px solid ${C.borderMed}`, background: "transparent",
              color: C.text, fontSize: 13, fontWeight: 500,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill={C.primary} stroke="none">
                <polygon points="1,1 11,6 1,11" />
              </svg>
              Send RFQ
            </button>
            <div style={{ cursor: "pointer", fontSize: 20, color: C.textMuted, lineHeight: 1 }}>⋮</div>
          </div>
        </div>

      </div>
    );
  };

  /* ═══════════ RENDER ═══════════ */
  return (
    <div style={{
      fontFamily: "'Open Sans', sans-serif",
      background: C.bgPage,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Hide scrollbar globally for this page */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* ═══ TOP HEADER BAR ═══ */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "10px 20px",
        background: C.white,
        marginBottom: 6,
        gap: 20, flexShrink: 0,
      }}>
        {/* Back arrow + RFQ name */}
        <div onClick={onClose} style={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.65)" strokeWidth="2">
            <polyline points="15,6 9,12 15,18" />
          </svg>
        </div>
        <div style={{ flexShrink: 0, maxWidth: 260 }}>
          <div style={{
            fontSize: 16, fontWeight: 700, color: C.text,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{tender.rfqName || tender.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
            {tender.mode && (
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1">
                <rect x="1" y="3.5" width="12" height="8" rx="1" />
                <line x1="4" y1="3.5" x2="4" y2="11.5" />
                <line x1="7" y1="3.5" x2="7" y2="11.5" />
                <line x1="10" y1="3.5" x2="10" y2="11.5" />
              </svg>
            )}
            <span>{subtitle || tender.tags}</span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 36, background: C.border, flexShrink: 0 }} />

        {/* Current Round */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#52c41a" }}>0</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Current Round</div>
        </div>

        <div style={{ width: 1, height: 36, background: C.border, flexShrink: 0 }} />

        {/* Response Rate */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 14 }}>
            <span style={{ fontWeight: 700, color: C.text }}>0</span>
            <span style={{ color: C.textMuted }}> /0</span>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Response Rate</div>
        </div>

        <div style={{ width: 1, height: 36, background: C.border, flexShrink: 0 }} />

        {/* Start Date */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{startDate}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Start Date</div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          {/* Chat — grey circular bg */}
          <div style={{
            width: 36, height: 36, borderRadius: 18, background: "#efefef",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5">
              <path d="M4 5h14v10H8l-4 3V5z" />
            </svg>
          </div>

          <div style={{ width: 1, height: 24, background: C.border }} />

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textMuted }}>
            <span style={{ cursor: "pointer" }}>K</span>
            <span style={{ cursor: "pointer" }}>&lt;</span>
            <span style={{ fontWeight: 600, color: C.text, margin: "0 2px" }}>1</span>
            <span style={{ cursor: "pointer" }}>&gt;</span>
          </div>

          <div style={{ width: 1, height: 24, background: C.border }} />

          {/* Bell — solid filled */}
          <div style={{ cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="rgba(0,0,0,0.75)" stroke="none">
              <path d="M10 2.5a4.5 4.5 0 00-4.5 4.5v3L4 12h12l-1.5-2V7A4.5 4.5 0 0010 2.5z" />
              <path d="M8.5 14a1.5 1.5 0 003 0" />
            </svg>
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15, background: "#bdbdbd",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>N</span>
            </div>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polyline points="3,4 5,6 7,4" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </div>

      {/* ═══ BODY: SIDEBAR + CONTENT ═══ */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, padding: 6, gap: 6 }}>

        {/* ─── LEFT SIDEBAR ─── */}
        <div style={{
          width: 230, background: C.white, borderRadius: 4,
          display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
          {/* Main RFQ / Amended tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            <div style={{
              flex: 1, padding: "13px 0", textAlign: "center",
              fontSize: 14, fontWeight: 700, color: C.primary,
              borderBottom: `2px solid ${C.primary}`, cursor: "pointer",
            }}>Main RFQ</div>
            <div style={{
              flex: 1, padding: "13px 0", textAlign: "center",
              fontSize: 14, fontWeight: 400, color: C.textMuted, cursor: "pointer",
            }}>Amended</div>
          </div>

          {/* Line Items + Add button */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 16px", borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Line Items</span>
            <div onClick={onAddLineItem} style={{
              width: 28, height: 28, borderRadius: 14,
              background: "#efefef", color: C.text,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16, fontWeight: 600, lineHeight: 1,
            }}>+</div>
          </div>

          {/* Filter list */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {SIDEBAR_FILTERS.map((filter) => {
              const isActive = filter === activeFilter;
              const count = filterCounts[filter] || 0;
              const hasItems = count > 0;
              return (
                <div
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 16px",
                    borderRight: isActive ? `4px solid ${C.sidebarActiveBorder}` : "4px solid transparent",
                    background: isActive ? C.sidebarActive : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    fontWeight: isActive || hasItems ? 600 : 400,
                    color: hasItems ? C.text : C.textMuted,
                  }}>{filter}</span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: hasItems ? 600 : 400,
                    color: hasItems ? C.text : C.textMuted,
                  }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bgPage, minWidth: 0, gap: 6 }}>

          {/* Filter bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "8px 20px",
            background: C.white, borderRadius: 4,
            flexShrink: 0,
          }}>
            {/* Checkbox */}
            <div style={{
              width: 18, height: 18, borderRadius: 3,
              border: `1.5px solid ${C.borderMed}`, cursor: "pointer", flexShrink: 0,
            }} />

            {/* Status */}
            <span style={{ fontSize: 13, color: C.textMuted, flexShrink: 0 }}>Status</span>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 14px", borderRadius: 16, height: 30,
              border: `1px solid ${C.borderLight}`, fontSize: 13, color: C.textLight,
              cursor: "pointer", minWidth: 100, flexShrink: 0,
            }}>
              <span>Select</span>
              <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="3,4 5,6 7,4" fill="none" stroke={C.textMuted} strokeWidth="1.5" /></svg>
            </div>

            {/* Separator */}
            <div style={{ width: 1, height: 22, background: C.borderMed, flexShrink: 0 }} />

            {/* More Filters */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 500, color: C.text, cursor: "pointer", flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.textMuted} strokeWidth="1.3">
                <path d="M1.5 2.5h11L8.5 7v4l-3 1.5V7L1.5 2.5z" />
              </svg>
              More Filters
            </div>

            {/* Separator */}
            <div style={{ width: 1, height: 22, background: C.borderMed, flexShrink: 0 }} />

            {/* Sort By — on the LEFT side */}
            <span style={{ fontSize: 13, color: C.textMuted, flexShrink: 0 }}>Sort By</span>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 14px", borderRadius: 16, height: 30,
              border: `1px solid ${C.borderLight}`, fontSize: 13, color: C.textLight,
              cursor: "pointer", minWidth: 110, flexShrink: 0,
            }}>
              <span>Updated At</span>
              <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="3,4 5,6 7,4" fill="none" stroke={C.textMuted} strokeWidth="1.5" /></svg>
            </div>

            {/* Spacer pushes Reports to the right */}
            <div style={{ flex: 1 }} />

            {/* Reports button */}
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 16px", borderRadius: 4, height: 30,
              border: "none", background: C.primary, color: "#fff",
              fontSize: 13, fontWeight: 500, cursor: "pointer", flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.5">
                <line x1="7" y1="2" x2="7" y2="10" />
                <polyline points="4,7 7,10 10,7" />
                <line x1="2" y1="13" x2="12" y2="13" />
              </svg>
              Reports
            </button>

            {/* Kebab */}
            <div style={{ cursor: "pointer", fontSize: 20, color: C.textMuted, lineHeight: 1, flexShrink: 0 }}>⋮</div>
          </div>

          {/* ─── CARDS ─── */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {lineItems.map((item, idx) => renderCard(item, idx))}

            {lineItems.length === 0 && (
              <div style={{ padding: 60, textAlign: "center", color: C.textMuted, fontSize: 14 }}>
                No line items created yet. Click <strong>+</strong> to add line items.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}