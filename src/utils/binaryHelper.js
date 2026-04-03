import User from "../models/User.js";

// ========================
// 🔥 STRONG / WEAK LEG DETECT
// ========================
export const getLegInfo = async (userId) => {
  try {

    const user = await User.findOne({ referralId: userId });

    if (!user) return null;

    let left = user.leftBusiness || 0;
    let right = user.rightBusiness || 0;

    let strongLeg = null;
    let weakLeg = null;
    let strongValue = 0;
    let weakValue = 0;

    if (left > right) {
      strongLeg = "left";
      weakLeg = "right";
      strongValue = left;
      weakValue = right;
    } 
    else if (right > left) {
      strongLeg = "right";
      weakLeg = "left";
      strongValue = right;
      weakValue = left;
    } 
    else {
      strongLeg = "equal";
      weakLeg = "equal";
      strongValue = left;
      weakValue = right;
    }

    return {
      strongLeg,
      weakLeg,
      strongValue,
      weakValue,
      difference: Math.abs(left - right)
    };

  } catch (err) {
    console.error("Leg Error:", err.message);
    return null;
  }
};