import mongoose from "mongoose";

export const VALID_GENDERS = ["male", "female", "other"];

export const validateProfileFields = (body) => {
  const { dateOfBirth, gender, phone, address, medicalHistory } = body ?? {};
  const set = {};

  if (dateOfBirth !== undefined) {
    const parsed = new Date(dateOfBirth);
    if (Number.isNaN(parsed.getTime())) {
      return {
        error: {
          status: 400,
          body: {
            success: false,
            message: "dateOfBirth must be a valid date",
          },
        },
      };
    }
    set.dateOfBirth = parsed;
  }

  if (gender !== undefined) {
    if (!VALID_GENDERS.includes(gender)) {
      return {
        error: {
          status: 400,
          body: {
            success: false,
            message: `gender must be one of: ${VALID_GENDERS.join(", ")}`,
          },
        },
      };
    }
    set.gender = gender;
  }

  if (phone !== undefined) {
    if (typeof phone !== "string") {
      return {
        error: {
          status: 400,
          body: {
            success: false,
            message: "phone must be a string when provided",
          },
        },
      };
    }
    const trimmed = phone.trim();

    // Normalize by removing common separators
    const normalized = trimmed.replace(/[\s()-]/g, "");

    // Accept Sri Lankan formats:
    //  - Local: 0XXXXXXXXX (10 digits, leading 0)
    //  - International: +94XXXXXXXXX or 94XXXXXXXXX
    let storedValue = null;

    if (/^0\d{9}$/.test(normalized)) {
      // Convert local 0XXXXXXXXX to E.164 +94XXXXXXXXX
      storedValue = `+94${normalized.slice(1)}`;
    } else if (/^\+94\d{9}$/.test(normalized)) {
      storedValue = normalized;
    } else if (/^94\d{9}$/.test(normalized)) {
      storedValue = `+${normalized}`;
    } else {
      return {
        error: {
          status: 400,
          body: {
            success: false,
            message:
              "phone must be a valid Sri Lankan number (e.g. 0771234567 or +94771234567)",
          },
        },
      };
    }

    set.phone = storedValue;
  }

  if (address !== undefined) {
    if (typeof address !== "string") {
      return {
        error: {
          status: 400,
          body: {
            success: false,
            message: "address must be a string when provided",
          },
        },
      };
    }
    set.address = address;
  }

  if (medicalHistory !== undefined) {
    if (typeof medicalHistory !== "string") {
      return {
        error: {
          status: 400,
          body: {
            success: false,
            message: "medicalHistory must be a string when provided",
          },
        },
      };
    }
    set.medicalHistory = medicalHistory;
  }

  return { set };
};

export const validateUserIdObjectId = (
  userId,
  { fieldName = "userId", invalidMessage } = {},
) => {
  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: `${fieldName} is required`,
      },
    };
  }

  if (!mongoose.isValidObjectId(userId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: invalidMessage || `${fieldName} must be a valid ObjectId`,
      },
    };
  }

  return null;
};
