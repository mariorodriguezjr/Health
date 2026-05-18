export const patients = {
  mario: {
    name: "Mario",
    labs: [
      { date: "2025-04-17", marker: "A1C", value: 5.3, unit: "%", normalLow: 4.0, normalHigh: 5.6, category: "Glucose" },
      { date: "2026-01-30", marker: "A1C", value: 5.2, unit: "%", normalLow: 4.0, normalHigh: 5.6, category: "Glucose" },

      { date: "2025-04-17", marker: "Glucose", value: 82, unit: "mg/dL", normalLow: 65, normalHigh: 99, category: "Glucose" },
      { date: "2026-01-30", marker: "Glucose", value: 74, unit: "mg/dL", normalLow: 65, normalHigh: 99, category: "Glucose" },

      { date: "2025-04-17", marker: "LDL", value: 89, unit: "mg/dL", normalLow: 0, normalHigh: 99, category: "Cholesterol" },
      { date: "2026-01-30", marker: "LDL", value: 96, unit: "mg/dL", normalLow: 0, normalHigh: 99, category: "Cholesterol" },

      { date: "2025-04-17", marker: "HDL", value: 50, unit: "mg/dL", normalLow: 40, normalHigh: 100, category: "Cholesterol" },
      { date: "2026-01-30", marker: "HDL", value: 51, unit: "mg/dL", normalLow: 40, normalHigh: 100, category: "Cholesterol" },

      { date: "2025-04-17", marker: "Triglycerides", value: 50, unit: "mg/dL", normalLow: 0, normalHigh: 150, category: "Cholesterol" },
      { date: "2026-01-30", marker: "Triglycerides", value: 63, unit: "mg/dL", normalLow: 0, normalHigh: 150, category: "Cholesterol" },

      { date: "2025-04-17", marker: "Creatinine", value: 0.82, unit: "mg/dL", normalLow: 0.6, normalHigh: 1.24, category: "Kidney" },
      { date: "2026-01-30", marker: "Creatinine", value: 0.82, unit: "mg/dL", normalLow: 0.6, normalHigh: 1.24, category: "Kidney" },

      { date: "2025-04-17", marker: "AST", value: 13, unit: "U/L", normalLow: 10, normalHigh: 40, category: "Liver" },
      { date: "2026-01-30", marker: "AST", value: 15, unit: "U/L", normalLow: 10, normalHigh: 40, category: "Liver" },

      { date: "2025-04-17", marker: "ALT", value: 7, unit: "U/L", normalLow: 9, normalHigh: 46, category: "Liver" },
      { date: "2026-01-30", marker: "ALT", value: 8, unit: "U/L", normalLow: 9, normalHigh: 46, category: "Liver" },

      { date: "2025-04-17", marker: "TSH", value: 1.98, unit: "mIU/L", normalLow: 0.4, normalHigh: 4.5, category: "Thyroid" },
      { date: "2026-01-30", marker: "TSH", value: 1.96, unit: "mIU/L", normalLow: 0.4, normalHigh: 4.5, category: "Thyroid" },
    ],
  },

  cici: {
    name: "Cici",
    labs: [
      { date: "2025-01-20", marker: "A1C", value: 5.1, unit: "%", normalLow: 4.0, normalHigh: 5.6, category: "Glucose" },
      { date: "2025-01-20", marker: "Glucose", value: 84, unit: "mg/dL", normalLow: 65, normalHigh: 99, category: "Glucose" },

      { date: "2025-01-20", marker: "LDL", value: 95, unit: "mg/dL", normalLow: 0, normalHigh: 99, category: "Cholesterol" },
      { date: "2025-01-20", marker: "HDL", value: 91, unit: "mg/dL", normalLow: 50, normalHigh: 100, category: "Cholesterol" },
      { date: "2025-01-20", marker: "Triglycerides", value: 52, unit: "mg/dL", normalLow: 0, normalHigh: 150, category: "Cholesterol" },

      { date: "2025-01-20", marker: "Creatinine", value: 0.72, unit: "mg/dL", normalLow: 0.5, normalHigh: 0.96, category: "Kidney" },

      { date: "2025-01-20", marker: "AST", value: 22, unit: "U/L", normalLow: 10, normalHigh: 30, category: "Liver" },
      { date: "2025-01-20", marker: "ALT", value: 24, unit: "U/L", normalLow: 6, normalHigh: 29, category: "Liver" },

      { date: "2025-01-20", marker: "TSH", value: 1.21, unit: "mIU/L", normalLow: 0.4, normalHigh: 4.5, category: "Thyroid" },

      { date: "2025-01-20", marker: "Vitamin D", value: 24, unit: "ng/mL", normalLow: 30, normalHigh: 100, category: "Vitamins" },
    ],
  },
};

export const trackedMarkers = [
  "A1C",
  "Glucose",
  "LDL",
  "HDL",
  "Triglycerides",
  "Creatinine",
  "AST",
  "ALT",
  "TSH",
  "Vitamin D",
];

export type PatientKey = keyof typeof patients;
export type Lab = (typeof patients)[PatientKey]["labs"][number];