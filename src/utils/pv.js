// ========================
// 🔥 JOINING PV
// ========================
export const getPV = (amount, plan = "joining") => {

  if (!amount || amount <= 0) return 0;

  // 🔹 Joining → ₹1000 = 1 PV
  if (plan === "joining") {
    return amount / 1000;
  }

  // 🔹 Property → call property function
  if (plan === "property") {
    return getPropertyPV(amount);
  }

  return 0;
};

// ========================
// 🔥 PROPERTY PV (PROJECT BASED)
// ========================
export const getPropertyPV = (amount, project = "default") => {

  if (!amount || amount <= 0) return 0;

  // 🔹 Project wise PV logic
  if (project === "A") {
    return amount / 500;   // high value project
  }

  if (project === "B") {
    return amount / 1000;
  }

  if (project === "C") {
    return amount / 2000;
  }

  // 🔹 default logic
  if (amount >= 100000) return 200;
  if (amount >= 50000) return 80;
  if (amount >= 25000) return 30;

  return amount / 2000;
};