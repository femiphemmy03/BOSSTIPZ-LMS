// apps/backend/utils/constants.js

// Pricing constants (hard-coded, cannot be changed by Admin/Lecturer)
const PRICING = {
  TOPIC: 500,        // ₦500 per topic
  COURSE: 5000,      // ₦5,000 per course
  TRCN: 2000,        // ₦2,000 for TRCN practice
  DEVELOPER_FEE: 0.12 // 12% developer fee
};

/// Matric number validation (Nigeria standard: allow letters, numbers, slash, dash)
function validateMatricNumber(matric) {
  const regex = /^[A-Za-z0-9\/-]+$/;
  return regex.test(matric);
}

module.exports = {
  PRICING,
  validateMatricNumber
};
