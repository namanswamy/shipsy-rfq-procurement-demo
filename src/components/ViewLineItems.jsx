import React from "react";
import C from "../config/colors";
import { CloseIcon } from "./Common";

export default function ViewLineItems({ tender, lineItems, onClose, onSendRfq }) {
  const vendorType = tender.vendorType;

  // Determine columns based on vendor type
  const getColumns = () => {
    switch (vendorType) {
      case "Freight Forwarder":
      case "Shipping Line":
        return ["#", "POL", "POD", "Container Size", "Incoterm", "Cargo", "Product"];
      case "CHA":
        return ["#", "POD Group"];
      case "CFS":
      case "ICD":
        return ["#", "POD"];
      case "Break Bulk Vendor":
        return ["#", "POL", "POD", "Cargo Type", "Material PO No."];
      case "Surveyor":
        return ["#", "POL", "POD", "Project Name", "Cargo Name"];
      default:
        return ["#", "Details"];
    }
  };

  const getCellValue = (item, col) => {
    switch (col) {
      case "#": return item.id;
      case "POL": return item.pol || "-";
      case "POD": return item.pod || "-";
      case "Container Size": return item.containerSize || "-";
      case "Incoterm": return item.incoterm || "-";
      case "Cargo": return item.cargo || "-";
      case "Product": return item.product || "-";
      case "POD Group": return item.podGroup || "-";
      case "Cargo Type": return item.cargoType || "-";
      case "Material PO No.": return item.materialPONo || "-";
      case "Project Name": return item.projectName || "-";
      case "Cargo Name": return item.cargoName || "-";
      default: return "-";
    }
  };

  const columns = getColumns();

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 500, animation: "fadeIn .2s ease-out" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 800,
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
              <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Line Items</span>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                {tender.rfqName || "Untitled"} &middot; {lineItems.length} items
              </div>
            </div>
          </div>
          <button onClick={onSendRfq} style={{
            padding: "9px 28px", borderRadius: 6, border: "none",
            background: C.submitBlue, color: C.white, fontSize: 14,
            fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(26,115,232,0.3)",
          }}>Send RFQ</button>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={{
                    padding: "12px 16px", fontSize: 12, fontWeight: 600,
                    color: C.textMuted, textAlign: "left",
                    borderBottom: `1px solid ${C.border}`,
                    background: C.headerBg, position: "sticky", top: 0,
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.rowHover}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {columns.map((col) => (
                    <td key={col} style={{
                      padding: "12px 16px", fontSize: 13.5, color: C.text,
                      borderBottom: "1px solid #f0f0f0",
                    }}>
                      {col === "#" ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 24, height: 24, borderRadius: 12,
                          background: "#e3f2fd", color: C.primary, fontSize: 11, fontWeight: 600,
                        }}>{getCellValue(item, col)}</span>
                      ) : (
                        getCellValue(item, col)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {lineItems.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 14 }}>
              No line items created yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
