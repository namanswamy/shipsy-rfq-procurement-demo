# RFQ Procurement Demo — Context for Claude

## Project Overview
This is a **React (Vite)** demo app replicating the Shipsy EXIM RFQ Procurement module. It's a frontend-only prototype (no backend) deployed to Vercel.

- **Live URL**: https://rfq-app-six.vercel.app
- **GitHub**: https://github.com/namanswamy/shipsy-rfq-procurement-demo
- **Tech**: React 19 + Vite, inline styles (no CSS framework), Open Sans font, Ant Design color tokens
- **Deploy**: `npx vercel --prod` from project root
- **Push**: `git add . && git commit -m "msg" && git push`

---

## Architecture

### File Structure
```
src/
  App.jsx                    — Main page: Manage RFQ listing, tabs, table rows, stepper, panels
  main.jsx                   — Entry point
  index.css                  — Global styles (Open Sans import, reset)
  config/
    colors.js                — Color tokens (Ant Design: #1890FF primary, rgba text colors, #E8E8E8 borders)
    rfqConfig.js             — ALL business logic config: vendor types, cascading rules, line item fields, dropdown options
  components/
    Common.jsx               — Shared UI: Dropdown, MultiSelectDropdown, TextInput, TextArea, StatusBadge, FileUpload, icons
    CreateTender.jsx          — Side panel: RFQ tender creation form with cascading vendor-type logic
    LineItemCreation.jsx      — Side panel: Line item form (different fields per vendor type)
    ViewLineItems.jsx         — Side panel: Table of created line items
    SendRfq.jsx               — Side panel: Send RFQ form (bidder multi-select, deadline, attachments)
```

### Key reference file (NOT part of the app):
- `../../app2.jsx` — Real production frontend code for the dashboard. Used as UI reference for styling.

---

## Business Flow (from BRD)

### 1. RFQ Tender Creation (CreateTender.jsx)
Progressive cascading form — fields appear one by one:

**Step 1**: Vendor Type (always shown)
**Step 2**: Mode (only for FF: FCL/LCL/Air/BB, SL: FCL/LCL/BB)
**Step 3**: Type (Export/Import) — after mode filled, or directly for non-mode vendors
**Step 4**: Sub Type — depends on vendor+mode+type combo:
  - FF + FCL + Export → Liquid Shipment, Solid Shipment
  - FF + FCL + Import → Freight Management
  - SL + FCL + Export → Solid Shipment, Local, Incidental
  - SL + FCL + Import → Ocean Freight, Local
  - CHA + Import → Other Business, New Energy
  - Surveyor → Marine Warranty, Bulk Surveyor
**Step 5**: Segment (only CFS + Import) → DPD-CFS, DPD-DPD, Non-DPD

After all cascading fields complete → **Standard Fields** appear:
- Preparation Date, Start & End Date
- RFQ Name, RFQ Type (Spot/Normal for all; COA for BB only)
- Business Unit (Petchem, Jio, Retail, O2C, New Energy)
- Sub Business Unit (RBL, JPL, RJIL, RPPMSL, CAPEX, DIGITAL, UL, GROCERY, OTHER)
- Insurance Required (FF/SL only)
- Documents (multi-row, categories: MSDS Certificates, Packing List, Custom Invoice, Insurance Copy, Pickup Request Form, Custom Invoice/PL, Other, IIP/UN Certificate, TNC)
- Terms & Conditions (expandable, rows with S.N., text, Mandatory toggle, Remarks toggle, Doc upload, delete)

### 2. Line Item Creation (LineItemCreation.jsx)
Different form per vendor type — configured in `rfqConfig.js > LINE_ITEM_FIELDS`:

| Vendor | Key Fields | Creation Logic |
|--------|-----------|---------------|
| FF | POL, POD, Container Size (20DV/40DV/40HC/etc), Container Type, Incoterm (EXW/FOB/FCA/CIF/DAP/DDU/DDP), Cargo (General/Haz), Product, Rates | POL x POD x Container x Incoterm |
| SL | POL Groups, POL, POD, Container Size, Incoterm | POL x POD x Container x Incoterm |
| CHA | POD Group (Mumbai Group, Gujarat Group, ROI Group) | 1 per POD Group |
| CFS | POD multiselect | 1 per POD |
| ICD | POD multiselect | 1 per POD |
| BB | Shipment Details + Cargo Details (Material PO, Chartering Terms, Laycan, etc) | POL x POD |
| Surveyor | RFQ Details + Cargo + Dimensions + Commercials | POL x POD |
| Transporter | N/A (rates via integration) | N/A |

### 3. Send RFQ (SendRfq.jsx)
- Deadline (date picker, required)
- Bidder (multi-select with "Select All", vendor list per vendor type)
- Message, Internal remark, Reason dropdown
- Number of Contract Rates (FF/SL only)
- Change Free Days (FF/SL only)
- Attachments (add/remove upload rows)

### 4. Manage RFQ Listing (App.jsx)
- Top bar: Grid icon, "Manage RFQ", Plan Creation Period date range, Bell (99+), Avatar
- Filter bar: Mode chips (FCL/LCL/AIR/BB/ALL), Type chips (Export/Import/Charges), Sort By, More Filters
- Tabs: All, Live, On Time, Finalised, Open, Closed (bordered box with separators)
- Table: 8-column grid (16% 13% 7% 9% 10% 9% 8% 28%)
- Row stepper states: `plan_created` → `line_items` → sent (progress bar)
- "Edit RFQ Plan" appears below "Plan Created", "View Line Items" below line items count

---

## UI Design Tokens (colors.js)
- Primary: `#1890FF` (Ant Design blue)
- Text: `rgba(0,0,0,0.85)`, Secondary: `rgba(0,0,0,0.65)`, Muted: `rgba(0,0,0,0.45)`
- Border: `#E8E8E8`
- Success green: `#52c41a`
- Error red: `#F35A4E`
- Font: `'Open Sans', sans-serif` (14px base, line-height 1.5)
- Table header background: `#f5f0eb` (warm beige)

---

## Dropdown Behavior
- Only ONE dropdown open at a time (handled in `tog` function in CreateTender.jsx)
- Dropdown triggers use `onMouseDown` with `stopPropagation`
- Body div has `onMouseDown` that closes all dropdowns when clicking outside
- Dropdown options also have `onMouseDown` stopPropagation to prevent premature close

---

## Seed Data
Demo rows in App.jsx include:
- 7 vendor-type demo rows (FF, SL, CHA, CFS, ICD, BB, Surveyor) with `stepper: "plan_created"` — click "+ Add Line Items"
- 4 "Send RFQ ready" rows with line items already added — click "Send RFQ"
- 5 original screenshot rows (LIVE/CLOSED with progress bars)

---

## Commands
```bash
npm run dev          # Local dev server (hot reload)
npm run build        # Production build
npx vercel --prod    # Deploy to Vercel
git push             # Push to GitHub
```
