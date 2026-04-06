import React, { useState, useCallback, useRef, useEffect } from "react";
import C from "../config/colors";
import { CloseIcon, Dropdown, UploadIcon } from "./Common";

const DEMO_VENDORS = {
  "Freight Forwarder": ["Kuehne+Nagel", "DHL Global Forwarding", "DB Schenker", "Expeditors", "Agility Logistics"],
  "Shipping Line": ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "ONE", "Evergreen"],
  CHA: ["ABC Customs Brokers", "XYZ CHA Services", "National CHA Corp"],
  CFS: ["Allcargo CFS", "Gateway CFS", "Balmer Lawrie CFS"],
  ICD: ["CONCOR ICD", "Inland ICD Pvt Ltd", "National ICD Services"],
  "Break Bulk Vendor": ["AAL Shipping", "BBC Chartering", "Rickmers Line"],
  Surveyor: ["SGS India", "Bureau Veritas", "Intertek Marine"],
  Transporter: ["TCI Express", "Safexpress", "Gati KWE"],
};

const REASONS = [
  "Rate Negotiation",
  "Capacity Check",
  "Renewal",
  "New Route",
  "Emergency Procurement",
];

export default function SendRfq({ tender, lineItems, onClose, onSend }) {
  const [dd, setDd] = useState({});
  const [form, setForm] = useState({ deadline: "", message: "", internalRemark: "", reason: "", contractRates: "" });
  const [selectedBidders, setSelectedBidders] = useState([]);
  const [bidderOpen, setBidderOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const bidderRef = useRef(null);

  const vendors = DEMO_VENDORS[tender.vendorType] || [];
  const isFFOrSL = tender.vendorType === "Freight Forwarder" || tender.vendorType === "Shipping Line";

  const tog = useCallback((key) => (val) => {
    if (val) setDd({ [key]: true });
    else setDd((p) => ({ ...p, [key]: false }));
  }, []);
  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  // Close bidder dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bidderRef.current && !bidderRef.current.contains(e.target)) setBidderOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleBidder = (v) => {
    setSelectedBidders((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  };

  const selectAllBidders = () => {
    if (selectedBidders.length === vendors.length) setSelectedBidders([]);
    else setSelectedBidders([...vendors]);
  };

  const addAttachment = () => setAttachments((p) => [...p, { id: Date.now(), name: "" }]);
  const removeAttachment = (id) => setAttachments((p) => p.filter((a) => a.id !== id));

  const handleSend = () => {
    if (!form.deadline) return alert("Please select a deadline");
    if (selectedBidders.length === 0) return alert("Please select at least one bidder");
    onSend(lineItems.map((i) => i.id), selectedBidders);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 500, animation: "fadeIn .2s ease-out" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 520,
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
            <span style={{ fontSize: 20, fontWeight: 600, color: C.text }}>Send RFQ</span>
          </div>
          <button onClick={handleSend} style={{
            padding: "9px 28px", borderRadius: 6, border: "none",
            background: C.submitBlue, color: C.white, fontSize: 14,
            fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(26,115,232,0.3)",
          }}>Send</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>

          {/* Info text */}
          <div style={{ fontSize: 13.5, color: C.textSec, lineHeight: 1.6, marginBottom: 24 }}>
            Round 1 will be automatically started after sending RFQ to {tender.vendorType}s.
            Select a deadline for Round 1.
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Deadline</span>
              <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>
            </div>
            <div style={{
              display: "flex", alignItems: "center",
              height: 38, padding: "0 12px", borderRadius: 6,
              border: `1px solid ${C.border}`, background: C.white,
            }}>
              <input type="date" value={form.deadline}
                onChange={(e) => set("deadline")(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: form.deadline ? C.text : C.placeholder, background: "transparent", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Bidder — Multi-select with Select All */}
          <div style={{ marginBottom: 22 }} ref={bidderRef}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Bidder</span>
              <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>
            </div>
            <div
              onMouseDown={(e) => { e.stopPropagation(); setBidderOpen(!bidderOpen); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                minHeight: 38, padding: "4px 12px", borderRadius: 6,
                border: `1px solid ${bidderOpen ? C.primary : C.border}`,
                background: C.white, cursor: "pointer", flexWrap: "wrap", gap: 4,
                boxShadow: bidderOpen ? `0 0 0 2px ${C.primary}22` : "none",
              }}
            >
              {selectedBidders.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selectedBidders.map((v) => (
                    <span key={v} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "2px 8px", borderRadius: 4, fontSize: 11.5,
                      background: "#e6f7ff", color: C.primary, fontWeight: 500,
                    }}>
                      {v}
                      <span onClick={(e) => { e.stopPropagation(); toggleBidder(v); }} style={{ cursor: "pointer", fontWeight: 700, fontSize: 13 }}>&times;</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 13.5, color: C.placeholder }}>Select Bidder</span>
              )}
              <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, transform: bidderOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                <polyline points="2,4 6,8 10,4" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {bidderOpen && (
              <div style={{
                position: "absolute", left: 24, right: 24, marginTop: 4,
                background: C.white, borderRadius: 8,
                boxShadow: C.ddShadow, border: `1px solid ${C.border}`,
                zIndex: 100, maxHeight: 250, overflowY: "auto",
                animation: "fadeSlideIn 0.15s ease-out",
              }}>
                {/* Select All */}
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={selectAllBidders}
                  style={{
                    padding: "10px 14px", fontSize: 13.5, color: C.primary,
                    cursor: "pointer", borderBottom: `1px solid ${C.border}`,
                    fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 3,
                    border: `1.5px solid ${selectedBidders.length === vendors.length ? C.primary : "#ccc"}`,
                    background: selectedBidders.length === vendors.length ? C.primary : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {selectedBidders.length === vendors.length && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" fill="none" stroke="white" strokeWidth="1.5" /></svg>}
                  </div>
                  Select All
                </div>
                {/* Vendor options */}
                {vendors.map((v) => {
                  const sel = selectedBidders.includes(v);
                  return (
                    <div key={v}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => toggleBidder(v)}
                      onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = "#f7f9fc"; }}
                      onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = sel ? "#f0f4ff" : "transparent"; }}
                      style={{
                        padding: "10px 14px", fontSize: 13.5, color: C.text,
                        cursor: "pointer", background: sel ? "#f0f4ff" : "transparent",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: 3,
                        border: `1.5px solid ${sel ? C.primary : "#ccc"}`,
                        background: sel ? C.primary : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {sel && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" fill="none" stroke="white" strokeWidth="1.5" /></svg>}
                      </div>
                      {v}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Message</span>
            </div>
            <textarea value={form.message} onChange={(e) => set("message")(e.target.value)}
              placeholder="Send the customised message to the bidders." rows={3}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text,
                resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Internal remark */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Internal remark</span>
            </div>
            <textarea value={form.internalRemark} onChange={(e) => set("internalRemark")(e.target.value)}
              placeholder="" rows={2}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text,
                resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Reason */}
          <div style={{ marginBottom: 22 }}>
            <Dropdown label="Reason" value={form.reason}
              placeholder="Select a reason" options={REASONS}
              open={dd.reason} onToggle={tog("reason")} onChange={set("reason")} />
          </div>

          {/* Number of Contract Rates — FF and SL only */}
          {isFFOrSL && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Number of Contract Rates</span>
                <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center",
                height: 38, padding: "0 12px", borderRadius: 6,
                border: `1px solid ${C.border}`, background: C.white, width: 100,
              }}>
                <input type="number" value={form.contractRates}
                  onChange={(e) => set("contractRates")(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: C.text, background: "transparent", width: "100%" }}
                />
              </div>
            </div>
          )}

          {/* Change Free Days — FF and SL only */}
          {isFFOrSL && (
            <div style={{ marginBottom: 22 }}>
              <span style={{ color: C.link, fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
                Change Free Days
              </span>
            </div>
          )}

          {/* Attachments */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.label, marginBottom: 8 }}>Attachments</div>
            {attachments.map((att) => (
              <div key={att.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <button style={{
                  height: 38, padding: "0 16px", borderRadius: 6,
                  border: `1px solid ${C.border}`, background: C.white,
                  fontSize: 13, color: C.textSec, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, flex: 1,
                }}>
                  <UploadIcon /> Choose file to upload
                </button>
                <div onClick={() => removeAttachment(att.id)} style={{
                  width: 22, height: 22, borderRadius: 11, background: "#fff1f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, border: "1px solid #ffa39e",
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" stroke="#f5222d" strokeWidth="1.5" fill="none">
                    <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                  </svg>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4 }}>
              <span onClick={addAttachment} style={{ color: "#1890FF", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>+ Add Attachment</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
