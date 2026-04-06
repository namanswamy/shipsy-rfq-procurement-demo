/* ═══════════════════════════════════════════════════════════════
   RFQ Configuration — Vendor-type cascading rules per BRD
   ═══════════════════════════════════════════════════════════════ */

export const VENDOR_TYPES = [
  "Freight Forwarder",
  "Shipping Line",
  "CHA",
  "CFS",
  "ICD",
  "Break Bulk Vendor",
  "Surveyor",
  "Transporter",
];

export const MODES = {
  "Freight Forwarder": ["FCL", "LCL", "Air", "BB"],
  "Shipping Line": ["FCL", "LCL", "Air", "BB"],
  CHA: null,
  CFS: null,
  ICD: null,
  "Break Bulk Vendor": null,
  Surveyor: null,
  Transporter: null,
};

export const TYPES = {
  "Freight Forwarder": ["Export", "Import"],
  "Shipping Line": ["Export", "Import"],
  CHA: ["Export", "Import"],
  CFS: ["Export", "Import"],
  ICD: ["Export", "Import"],
  "Break Bulk Vendor": ["Export", "Import"],
  Surveyor: ["Export", "Import"],
  Transporter: null,
};

/* Sub Type options keyed by vendorType -> mode -> type */
export function getSubTypes(vendorType, mode, type) {
  const map = {
    "Freight Forwarder": {
      FCL: {
        Export: ["Liquid Shipment", "Solid Shipment"],
        Import: ["Freight Management"],
      },
    },
    "Shipping Line": {
      FCL: {
        Export: ["Solid Shipment", "Local", "Incidental"],
        Import: ["Ocean Freight", "Local"],
      },
    },
    CHA: {
      _noMode: {
        Import: ["General Cargo", "New Energy"],
      },
    },
    Surveyor: {
      _noMode: {
        Export: ["Marine Warranty", "Bulk Surveyor"],
        Import: ["Marine Warranty", "Bulk Surveyor"],
      },
    },
  };

  const vendorMap = map[vendorType];
  if (!vendorMap) return null;

  const modeKey = mode || "_noMode";
  const modeMap = vendorMap[modeKey];
  if (!modeMap) return null;

  return modeMap[type] || null;
}

/* Segment shown only for CFS -> Import */
export function getSegments(vendorType, type) {
  if (vendorType === "CFS" && type === "Import") {
    return ["DPD-CFS", "DPD-DPD", "Non-DPD"];
  }
  return null;
}

/* Sub Type label changes contextually */
export function getSubTypeLabel(vendorType, mode, type) {
  if (vendorType === "Freight Forwarder" || vendorType === "Shipping Line") {
    return type === "Export" ? "Export Type" : type === "Import" ? "Import Type" : "Sub Type";
  }
  if (vendorType === "CHA") return "Sub Type";
  if (vendorType === "Surveyor") return "Sub Type";
  return "Sub Type";
}

/* Whether Mode field is shown */
export function showsMode(vendorType) {
  return MODES[vendorType] != null;
}

/* Whether Type field is shown */
export function showsType(vendorType) {
  return TYPES[vendorType] != null;
}

/* RFQ Type options — per BRD: Spot for all, Normal for all except BB, COA only for BB */
export function getRfqTypeOptions(vendorType) {
  if (vendorType === "Break Bulk Vendor") return ["Spot", "COA"];
  return ["Spot", "Normal"];
}

/* Whether Insurance Required is shown */
export function showsInsurance(vendorType) {
  return vendorType === "Freight Forwarder" || vendorType === "Shipping Line";
}

/* ─── Line Item field config per vendor type ─── */

export const LINE_ITEM_FIELDS = {
  "Freight Forwarder": {
    sections: [
      {
        title: "Origin",
        fields: [
          { key: "pols", label: "POL(s)", type: "multiselect", required: true, options: ["INMUN", "INNSA", "INPAV", "INCHN", "INDEL", "INKTP", "INHZA"] },
          { key: "originAddress", label: "Origin Address", type: "text" },
          { key: "originFreeDays", label: "Free Days", type: "number" },
          { key: "originEquipFreeDays", label: "Equipment Free Days", type: "number" },
        ],
      },
      {
        title: "Destination",
        fields: [
          { key: "pods", label: "POD", type: "multiselect", required: true, options: ["CNSHA", "CNNGB", "SGSIN", "AEJEA", "USLAX", "GBFXT", "DEHAM"] },
          { key: "destCountry", label: "Destination Country", type: "text" },
          { key: "placeOfDelivery", label: "Place of Delivery", type: "select", options: [] },
          { key: "destFreeDays", label: "Free Days", type: "number" },
          { key: "destEquipFreeDays", label: "Equipment Free Days", type: "number" },
          { key: "cfsFreeDays", label: "CFS Free Days", type: "number" },
        ],
      },
      {
        title: "Routing & Incoterm",
        fields: [
          { key: "incoterms", label: "Incoterm", type: "multiselect", required: true, options: ["EXW", "FOB", "FCA", "CIF", "DAP", "DDU", "DDP"] },
          { key: "finalPol", label: "Final POL", type: "select", options: ["INMUN", "INNSA", "INPAV", "INCHN", "INDEL", "INKTP"] },
          { key: "finalPod", label: "Final POD", type: "select", options: ["CNSHA", "CNNGB", "SGSIN", "AEJEA", "USLAX", "GBFXT", "DEHAM"] },
          { key: "country", label: "Country", type: "select", options: ["India", "China", "Singapore", "UAE", "USA", "UK", "Germany"] },
          { key: "grossWeight", label: "Gross Weight (Tons) per Container", type: "number" },
        ],
      },
      {
        title: "Container & Cargo",
        fields: [
          { key: "containerSizes", label: "Container Size", type: "multiselect", required: true, options: ["20DV", "40DV", "40HC", "20GP", "40HQ", "20OT", "40OT", "40GP", "20ISO"] },
          { key: "containerType", label: "Container Type", type: "select", options: ["STANDARD", "ISO TANKS", "REFRIGERATED", "OPEN TOP", "FLAT RACK", "HEAVY DUTY"] },
          { key: "cargoType", label: "Cargo", type: "select", required: true, options: ["General", "Haz"] },
          { key: "product", label: "Product", type: "text" },
          { key: "tentativeCount", label: "Tentative Count", type: "number" },
          { key: "loadPerContainer", label: "Load Per Container (MT)", type: "number" },
          { key: "totalBl", label: "No. of B/Ls", type: "number" },
          { key: "noOfShipments", label: "No. of Shipments", type: "number", required: true },
          { key: "procurementChargeTypes", label: "Procurement Charge Type", type: "select", options: ["Back to Back", "Console", "Both"] },
        ],
      },
      {
        title: "Rates",
        fields: [
          { key: "referenceRate", label: "Reference Rate", type: "number" },
          { key: "referenceRateCurrency", label: "Currency", type: "select", options: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "CNY", "JPY"] },
          { key: "budgetRate", label: "Budget Rate", type: "number" },
          { key: "budgetRateCurrency", label: "Currency", type: "select", options: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "CNY", "JPY"] },
        ],
      },
      {
        title: "Additional",
        fields: [
          { key: "storageDays", label: "Storage Days at CFS", type: "number" },
          { key: "cfsName", label: "CFS Name", type: "text" },
          { key: "specialInstructions", label: "Special Instructions", type: "textarea" },
        ],
      },
    ],
    creationLogic: "POL x POD x Container Size x Incoterm",
    comboFields: ["pols", "pods", "containerSizes", "incoterms"],
  },

  "Shipping Line": {
    sections: [
      {
        title: "Origin",
        fields: [
          { key: "polGroups", label: "POL Group(s)", type: "multiselect", required: true, options: ["West Coast India", "East Coast India", "South India"] },
          { key: "pols", label: "POL(s)", type: "multiselect", required: true, options: ["INMUN", "INNSA", "INPAV", "INCHN", "INDEL", "INKTP"] },
          { key: "originFreeDays", label: "Free Days", type: "number" },
          { key: "originEquipFreeDays", label: "Equipment Free Days", type: "number" },
        ],
      },
      {
        title: "Destination",
        fields: [
          { key: "pods", label: "POD", type: "multiselect", required: true, options: ["CNSHA", "CNNGB", "SGSIN", "AEJEA", "USLAX", "GBFXT", "DEHAM"] },
          { key: "destCountry", label: "Destination Country", type: "select", options: ["China", "Singapore", "UAE", "USA", "UK"] },
          { key: "destFreeDays", label: "Free Days", type: "number" },
          { key: "destEquipFreeDays", label: "Equipment Free Days", type: "number" },
          { key: "cfsFreeDays", label: "CFS Free Days", type: "number" },
        ],
      },
      {
        title: "Shipment Details",
        fields: [
          { key: "incoterms", label: "Incoterm", type: "multiselect", required: true, options: ["FOB", "CIF", "CFR", "EXW"] },
          { key: "finalPol", label: "Final POL", type: "select", options: ["INMUN", "INNSA", "INPAV"] },
          { key: "finalPod", label: "Final POD", type: "select", options: ["CNSHA", "CNNGB", "SGSIN"] },
          { key: "country", label: "Country", type: "select", options: ["India", "China", "Singapore"] },
          { key: "grossWeight", label: "Gross Weight (Tons) Per Container", type: "number" },
          { key: "containerSizes", label: "Container Size", type: "multiselect", required: true, options: ["20' GP", "40' GP", "40' HC", "20' RF", "40' RF"] },
          { key: "cargo", label: "Cargo", type: "text" },
          { key: "product", label: "Product", type: "text" },
          { key: "tentativeCount", label: "Tentative Count", type: "number" },
          { key: "referenceRate", label: "Reference Rate", type: "number" },
          { key: "budgetRate", label: "Budget Rate", type: "number" },
        ],
      },
    ],
    creationLogic: "POL x POD x Container Size x Incoterm",
    comboFields: ["pols", "pods", "containerSizes", "incoterms"],
  },

  CHA: {
    sections: [
      {
        title: "Line Item Details",
        fields: [
          { key: "podGroups", label: "POD Group", type: "multiselect", required: true, options: ["West Coast Group", "East Coast Group", "South India Group", "North India Group", "Central India Group"] },
        ],
      },
    ],
    creationLogic: "1 line item per POD Group",
    comboFields: ["podGroups"],
  },

  CFS: {
    sections: [
      {
        title: "Line Item Details",
        fields: [
          { key: "pods", label: "POD", type: "multiselect", required: true, options: ["INMUN", "INNSA", "INPAV", "INCHN", "INDEL", "INKTP", "INHZA", "INVTZ"] },
        ],
      },
    ],
    creationLogic: "1 line item per POD",
    comboFields: ["pods"],
  },

  ICD: {
    sections: [
      {
        title: "Line Item Details",
        fields: [
          { key: "pods", label: "POD", type: "multiselect", required: true, options: ["INMUN", "INNSA", "INPAV", "INCHN", "INDEL", "INKTP", "INHZA", "INVTZ"] },
        ],
      },
    ],
    creationLogic: "1 line item per POD",
    comboFields: ["pods"],
  },

  "Break Bulk Vendor": {
    sections: [
      {
        title: "Shipment Details",
        fields: [
          { key: "materialPONo", label: "Material PO No.", type: "text", required: true },
          { key: "charteringTerms", label: "Chartering Terms", type: "select", options: ["Voyage Charter", "Time Charter", "Bareboat Charter"] },
          { key: "shippingTerms", label: "Shipping Terms / Incoterms", type: "select", required: true, options: ["FOB", "CIF", "CFR", "EXW", "DDP", "FCA"] },
          { key: "laycan", label: "Laycan", type: "daterange" },
          { key: "cargoReadinessDate", label: "Cargo Readiness Date", type: "date" },
          { key: "daysForMovement", label: "Days Required for Cargo Movement to Port", type: "number" },
          { key: "supplierAddress", label: "Supplier Address", type: "text", conditionalOn: { field: "shippingTerms", value: "EXW" } },
          { key: "pols", label: "POL (Port of Loading)", type: "multiselect", required: true, options: ["INMUN", "INNSA", "INPAV", "INCHN"] },
          { key: "pods", label: "POD (Port of Discharge)", type: "multiselect", required: true, options: ["CNSHA", "CNNGB", "SGSIN", "AEJEA", "USLAX"] },
          { key: "finalDelivery", label: "Final Delivery", type: "text" },
          { key: "transhipmentRemarks", label: "Load / Transhipment Remarks", type: "textarea" },
        ],
      },
      {
        title: "Cargo Details",
        fields: [
          { key: "cargoDescription", label: "Cargo Description", type: "textarea", required: true },
          { key: "noOfPackages", label: "No of Packages", type: "number" },
          { key: "totalCBM", label: "Total CBM", type: "number" },
          { key: "totalNetWeight", label: "Total Net Weight (MT)", type: "number" },
          { key: "totalGrossWeight", label: "Total Gross Weight (MT)", type: "number" },
          { key: "cargoType", label: "Cargo Type", type: "select", options: ["General", "Hazardous", "Reefer", "Over Dimensional"] },
          { key: "cargoLoadPlan", label: "Cargo Load Plan", type: "file" },
          { key: "cargoPictures", label: "Cargo Pictures", type: "file" },
          { key: "packingList", label: "Packing List of the Cargo", type: "file" },
        ],
      },
    ],
    creationLogic: "POL x POD",
    comboFields: ["pols", "pods"],
  },

  Surveyor: {
    sections: [
      {
        title: "RFQ Details",
        fields: [
          { key: "projectName", label: "Project Name", type: "text", required: true },
          { key: "projectStartDate", label: "Project Commencement Date", type: "date", required: true },
          { key: "projectEndDate", label: "Project End Date", type: "date", required: true },
          { key: "addresses", label: "Address 1", type: "text", addMore: true },
          { key: "pols", label: "POL", type: "multiselect", required: true, options: ["INMUN", "INNSA", "INPAV", "INCHN"] },
          { key: "pods", label: "POD", type: "multiselect", required: true, options: ["CNSHA", "CNNGB", "SGSIN", "AEJEA", "USLAX"] },
          { key: "jobSites", label: "Job Site 1", type: "text", addMore: true },
        ],
      },
      {
        title: "Cargo Details",
        fields: [
          { key: "cargoName", label: "Cargo Name", type: "text", required: true },
          { key: "photos", label: "Photos (30 MB)", type: "file" },
          { key: "packingListUpload", label: "Packing List Upload", type: "file" },
          { key: "noOfContainers", label: "No. of Containers", type: "number" },
          { key: "grossPerMT", label: "Gross Per Metric Ton", type: "number" },
        ],
      },
      {
        title: "Dimensions",
        fields: [
          { key: "dimensions", label: "Dimensions", type: "text" },
          { key: "stackable", label: "Stackable", type: "select", options: ["Yes", "No"] },
          { key: "noOfPackage", label: "No. of Package", type: "number" },
          { key: "grossWeight", label: "Gross Weight", type: "number" },
          { key: "freightedCBM", label: "Freighted CBM", type: "number" },
        ],
      },
      {
        title: "Commercials",
        fields: [
          { key: "originChargeUOM", label: "Origin Surveyor Charge UOM", type: "select", options: ["Per BL", "Per Container", "Per Shipment", "Lumpsum"] },
          { key: "originCurrency", label: "Origin Currency", type: "select", options: ["INR", "USD", "EUR", "GBP"] },
          { key: "destChargeUOM", label: "Destination Surveyor Charge UOM", type: "select", options: ["Per BL", "Per Container", "Per Shipment", "Lumpsum"] },
          { key: "destCharge", label: "Destination Surveyor Charge", type: "number" },
          { key: "destRoadSupervision", label: "Destination Road Delivery Supervision", type: "select", options: ["Yes", "No"] },
          { key: "destRoadSupervisionCurrency", label: "Dest Road Delivery Supervision Currency", type: "select", options: ["INR", "USD", "EUR"] },
          { key: "miscChrgOrigin", label: "Surveyor Misc Chrg Origin", type: "number" },
          { key: "miscChrgDest", label: "Surveyor Misc Chrg Destination", type: "number" },
          { key: "destOvertimeChrg", label: "Destination Overtime Chrg Per Hour", type: "number" },
          { key: "originOvertimeChrg", label: "Origin Overtime Chrg Per Hour", type: "number" },
        ],
      },
    ],
    creationLogic: "POL x POD",
    comboFields: ["pols", "pods"],
  },

  Transporter: null,
};

/* Generate line items from combo fields */
export function generateLineItems(vendorType, formData) {
  const config = LINE_ITEM_FIELDS[vendorType];
  if (!config) return [];

  const { comboFields, creationLogic } = config;

  if (creationLogic === "1 line item per POD Group") {
    return (formData.podGroups || []).map((g, i) => ({
      id: i + 1,
      podGroup: g,
      ...formData,
    }));
  }

  if (creationLogic === "1 line item per POD") {
    return (formData.pods || []).map((p, i) => ({
      id: i + 1,
      pod: p,
      ...formData,
    }));
  }

  if (creationLogic === "POL x POD") {
    const pols = formData.pols || [];
    const pods = formData.pods || [];
    const items = [];
    let id = 1;
    for (const pol of pols) {
      for (const pod of pods) {
        items.push({ id: id++, pol, pod, ...formData });
      }
    }
    return items;
  }

  if (creationLogic === "POL x POD x Container Size x Incoterm") {
    const pols = formData.pols || [];
    const pods = formData.pods || [];
    const sizes = formData.containerSizes || [];
    const incoterms = formData.incoterms || [];
    const items = [];
    let id = 1;
    for (const pol of pols) {
      for (const pod of pods) {
        for (const size of sizes) {
          for (const incoterm of incoterms) {
            items.push({ id: id++, pol, pod, containerSize: size, incoterm, ...formData });
          }
        }
      }
    }
    return items;
  }

  return [];
}

/* Document categories */
export const DOCUMENT_CATEGORIES = [
  "Rate Sheet",
  "Terms & Conditions",
  "Scope of Work",
  "Supporting Document",
  "Other",
];

/* Vendor type short codes for chips */
export const VENDOR_CHIP = {
  "Freight Forwarder": "FF",
  "Shipping Line": "SL",
  CHA: "CHA",
  CFS: "CFS",
  ICD: "ICD",
  "Break Bulk Vendor": "BB",
  Surveyor: "SUR",
  Transporter: "TRP",
};
