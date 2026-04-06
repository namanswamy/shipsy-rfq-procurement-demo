import React, { useState, useRef, useEffect } from "react";
import C from "../config/colors";

/* ─── SVG Icons ─── */

export const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="#999" strokeWidth="1.2" />
    <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" stroke="#999" strokeWidth="1.2" />
    <line x1="5" y1="1.5" x2="5" y2="4" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="11" y1="1.5" x2="11" y2="4" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="#555">
    {[4, 11, 18].flatMap((cy) =>
      [4, 11, 18].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />)
    )}
  </svg>
);

export const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#666" strokeWidth="1.5">
    <circle cx="9" cy="9" r="6" />
    <line x1="13.5" y1="13.5" x2="18" y2="18" />
  </svg>
);

export const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#666" strokeWidth="1.2">
    <line x1="2" y1="4" x2="12" y2="4" />
    <line x1="4" y1="7" x2="10" y2="7" />
    <line x1="6" y1="10" x2="8" y2="10" />
  </svg>
);

export const CloseIcon = ({ onClick }) => (
  <svg onClick={onClick} width="22" height="22" viewBox="0 0 22 22" style={{ cursor: "pointer" }} stroke="#666" strokeWidth="2" fill="none">
    <line x1="5" y1="5" x2="17" y2="17" />
    <line x1="17" y1="5" x2="5" y2="17" />
  </svg>
);

export const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" stroke="#666" strokeWidth="1.5" fill="none">
    <line x1="7" y1="2" x2="7" y2="12" />
    <polyline points="3,6 7,2 11,6" />
  </svg>
);

export const ChevronIcon = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
    <polyline points="2,4 6,8 10,4" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" stroke="#555" strokeWidth="1.5" fill="none">
    <polyline points="4,2 8,6 4,10" />
  </svg>
);

export const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#555" strokeWidth="1.8">
    <polyline points="12,4 6,10 12,16" />
  </svg>
);

export function StepCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" fill="#e8f5e9" stroke={C.liveGreen} strokeWidth="1.5" />
      <polyline points="5,8 7,10 11,6" fill="none" stroke={C.liveGreen} strokeWidth="1.5" />
    </svg>
  );
}

export function StepEmpty({ color = "#ccc" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" fill="#f5f5f5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ─── Dropdown ─── */

export function Dropdown({ label, required, value, placeholder, options, open, onToggle, onChange, width, disabled }) {
  const ref = useRef(null);

  return (
    <div ref={ref} data-dropdown="true" style={{ position: "relative", width: width || "100%" }}>
      {label && (
        <div style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>{label}</span>
          {required && <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>}
        </div>
      )}
      <div
        onMouseDown={(e) => { e.stopPropagation(); if (!disabled) onToggle(!open); }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 38, padding: "0 12px", borderRadius: 6,
          border: `1px solid ${open ? C.primary : C.border}`,
          background: disabled ? "#f5f5f5" : C.white, cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: open ? `0 0 0 2px ${C.primary}22` : "none",
          transition: "border 0.15s, box-shadow 0.15s",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: 13.5, color: value ? C.text : C.placeholder, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value || placeholder}
        </span>
        <ChevronIcon open={open} />
      </div>
      {open && !disabled && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: C.white, borderRadius: 8,
          boxShadow: C.ddShadow, border: `1px solid ${C.border}`,
          zIndex: 100, overflow: "hidden", maxHeight: 220, overflowY: "auto",
          animation: "fadeSlideIn 0.15s ease-out",
        }}>
          {options.map((opt) => (
            <div
              key={opt}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { onChange(opt); onToggle(false); }}
              onMouseEnter={(e) => { if (value !== opt) e.currentTarget.style.background = "#f7f9fc"; }}
              onMouseLeave={(e) => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}
              style={{
                padding: "10px 14px", fontSize: 13.5, color: C.text,
                cursor: "pointer", background: value === opt ? "#f0f4ff" : "transparent",
                fontWeight: value === opt ? 600 : 400,
                borderLeft: value === opt ? `3px solid ${C.primary}` : "3px solid transparent",
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── MultiSelect Dropdown ─── */

export function MultiSelectDropdown({ label, required, values = [], placeholder, options, open, onToggle, onChange, width }) {
  const ref = useRef(null);

  const toggle = (opt) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };

  return (
    <div ref={ref} data-dropdown="true" style={{ position: "relative", width: width || "100%" }}>
      {label && (
        <div style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>{label}</span>
          {required && <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>}
        </div>
      )}
      <div
        onMouseDown={(e) => { e.stopPropagation(); onToggle(!open); }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          minHeight: 38, padding: "4px 12px", borderRadius: 6,
          border: `1px solid ${open ? C.primary : C.border}`,
          background: C.white, cursor: "pointer", flexWrap: "wrap", gap: 4,
          boxShadow: open ? `0 0 0 2px ${C.primary}22` : "none",
        }}
      >
        {values.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {values.map((v) => (
              <span key={v} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 4, fontSize: 11.5,
                background: "#e3f2fd", color: C.primary, fontWeight: 500,
              }}>
                {v}
                <span onClick={(e) => { e.stopPropagation(); toggle(v); }} style={{ cursor: "pointer", fontWeight: 700, fontSize: 13 }}>&times;</span>
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 13.5, color: C.placeholder }}>{placeholder}</span>
        )}
        <ChevronIcon open={open} />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: C.white, borderRadius: 8,
          boxShadow: C.ddShadow, border: `1px solid ${C.border}`,
          zIndex: 100, maxHeight: 220, overflowY: "auto",
          animation: "fadeSlideIn 0.15s ease-out",
        }}>
          {options.map((opt) => {
            const sel = values.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
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
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── TextInput ─── */

export function TextInput({ label, required, placeholder, value, onChange, icon, type = "text", disabled }) {
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <div style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>{label}</span>
          {required && <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>}
        </div>
      )}
      <div style={{
        display: "flex", alignItems: "center",
        height: 38, padding: "0 12px", borderRadius: 6,
        border: `1px solid ${C.border}`, background: disabled ? "#f5f5f5" : C.white,
      }}>
        <input
          type={type} value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: C.text, background: "transparent" }}
        />
        {icon}
      </div>
    </div>
  );
}

/* ─── TextArea ─── */

export function TextArea({ label, required, placeholder, value, onChange }) {
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <div style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>{label}</span>
          {required && <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>}
        </div>
      )}
      <textarea
        value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 6,
          border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text,
          resize: "vertical", fontFamily: "inherit", outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

/* ─── StatusBadge ─── */

export function StatusBadge({ status }) {
  const m = {
    LIVE: { bg: C.liveBg, color: C.liveGreen, border: C.liveGreen },
    DELAYED: { bg: C.delayedBg, color: C.delayedRed, border: C.delayedRed },
    "ON TIME": { bg: "#e8f5e9", color: "#2e7d32", border: "#2e7d32" },
    CLOSED: { bg: C.closedBg, color: C.closedGray, border: C.closedGray },
    OPEN: { bg: "#e3f2fd", color: C.primary, border: C.primary },
  };
  const s = m[status] || m.CLOSED;
  return (
    <span style={{
      display: "inline-block", padding: "3px 14px", borderRadius: 14,
      fontSize: 11.5, fontWeight: 600, letterSpacing: 0.5,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{status}</span>
  );
}

/* ─── File Upload ─── */

export function FileUpload({ label, required }) {
  return (
    <div>
      {label && (
        <div style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.label }}>{label}</span>
          {required && <span style={{ color: C.red, marginLeft: 3, fontSize: 13 }}>*</span>}
        </div>
      )}
      <button style={{
        height: 38, padding: "0 16px", borderRadius: 6,
        border: `1px solid ${C.border}`, background: C.white,
        fontSize: 13, color: C.textSec, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <UploadIcon /> Upload
      </button>
    </div>
  );
}

/* ─── Section Header ─── */

export function SectionHeader({ title, collapsed, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 0", cursor: "pointer",
        borderBottom: `1px solid ${C.border}`, marginBottom: 16,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" stroke="#555" strokeWidth="1.5" fill="none"
        style={{ transform: collapsed ? "rotate(0)" : "rotate(90deg)", transition: "transform 0.2s" }}>
        <polyline points="4,2 8,6 4,10" />
      </svg>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{title}</span>
    </div>
  );
}
