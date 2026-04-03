import User from "../models/User.js";

/**
 * 🔥 LEFT SIDE SPILLOVER
 */
const findLeftPlacement = async (user) => {
  try {
    if (!user.leftChild) {
      return { parent: user, position: "left" };
    }

    const leftUser = await User.findOne({ referralId: user.leftChild });

    if (!leftUser) {
      return { parent: user, position: "left" };
    }

    return await findLeftPlacement(leftUser);

  } catch (err) {
    console.error("Left Placement Error:", err.message);
    return null;
  }
};

/**
 * 🔥 RIGHT SIDE SPILLOVER
 */
const findRightPlacement = async (user) => {
  try {
    if (!user.rightChild) {
      return { parent: user, position: "right" };
    }

    const rightUser = await User.findOne({ referralId: user.rightChild });

    if (!rightUser) {
      return { parent: user, position: "right" };
    }

    return await findRightPlacement(rightUser);

  } catch (err) {
    console.error("Right Placement Error:", err.message);
    return null;
  }
};

/**
 * 🔥 MAIN FUNCTION
 */
export const findPlacement = async (sponsorId, preferredSide = "left") => {
  try {
    const sponsor = await User.findOne({ referralId: sponsorId });

    if (!sponsor) {
      console.log("❌ Sponsor not found");
      return null;
    }

    let placement = null;

    // 🔹 LEFT
    if (preferredSide === "left") {
      placement = await findLeftPlacement(sponsor);
    }

    // 🔹 RIGHT
    if (preferredSide === "right") {
      placement = await findRightPlacement(sponsor);
    }

    if (!placement) return null;

    // 🔥 🔥 MAIN FIX: UPDATE PARENT NODE
    const parent = placement.parent;

    if (placement.position === "left") {
      parent.leftChild = null; // placeholder
    }

    if (placement.position === "right") {
      parent.rightChild = null; // placeholder
    }

    await parent.save();

    return placement;

  } catch (err) {
    console.error("Placement Error:", err.message);
    return null;
  }
};