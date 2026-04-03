import React, { useState, useCallback } from "react";
import C from "../config/colors";
import { CloseIcon, Dropdown, CalendarIcon } from "./Common";

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
  const [form, setForm] = useState({ deadline: "", bidder: "", message: "", internalRemark: "", reason: "", contractRates: "" });
  const vendors = DEMO_VENDORS[tender.vendorType] || [];

  const tog = useCallback((key) => (val) => setDd((p) => ({ ...p, [key]: val })), []);
  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSend = () => {
    if (!form.deadline) return alert("Please select a deadline");
    if (!form.bidder) return alert("Please select a bidder");
    onSend(lineItems.map((i) => i.id), [form.bidder]);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 500, animation: "fadeIn .2s ease-out" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
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
            <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Send RFQ</span>
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
          <div style={{
            fontSize: 13.5, color: C.textSec, lineHeight: 1.6, marginBottom: 24,
          }}>
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
              <input
                type="date" value={form.deadline}
                onChange={(e) => set("deadline")(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: form.deadline ? C.text : C.placeholder, background: "transparent", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Bidder */}
          <div style={{ marginBottom: 22 }}>
            <Dropdown
              label="Bidder" required value={form.bidder}
              placeholder="Select Bidder" options={vendors}
              open={dd.bidder} onToggle={tog("bidder")} onChange={set("bidder")}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Message</span>
            </div>
            <textarea
              value={form.message}
              onChange={(e) => set("message")(e.target.value)}
              placeholder="Send the customised message to the bidders."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text,
                resize: "vertical", fontFamily: "inherit", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Internal remark */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>Internal remark</span>
            </div>
            <textarea
              value={form.internalRemark}
              onChange={(e) => set("internalRemark")(e.target.value)}
              placeholder=""
              rows={2}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text,
                resize: "vertical", fontFamily: "inherit", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Reason */}
          <div style={{ marginBottom: 22 }}>
            <Dropdown
              label="Reason" value={form.reason}
              placeholder="Select a reason" options={REASONS}
              open={dd.reason} onToggle={tog("reason")} onChange={set("reason")}
            />
          </div>

          {/* Number of Contract Rates */}
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
              <input
                type="number" value={form.contractRates}
                onChange={(e) => set("contractRates")(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: C.text, background: "transparent", width: "100%" }}
              />
            </div>
          </div>

          {/* Change Free Days link */}
          <div style={{ marginBottom: 22 }}>
            <span style={{ color: C.link, fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
              Change Free Days
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
