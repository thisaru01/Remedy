import mongoose from "mongoose";

export const USER_STATUSES = ["active", "inactive"];
export const USER_ROLES = ["patient", "doctor", "admin"];

const passwordPolicyRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const validatePasswordComplexity = (password) => {
  if (typeof password !== "string") {
    return {
      status: 400,
      body: {
        success: false,
        message: "password must be a string",
      },
    };
  }

  if (!passwordPolicyRegex.test(password)) {
    return {
      status: 400,
      body: {
        success: false,
        message:
          "Password must be at least 8 characters long and include at least one letter, one number, and one special character",
      },
    };
  }

  return null;
};

export const validateRegisterInput = (body) => {
  const { name, email, password, role } = body ?? {};

  if (!name || !email || !password) {
    return {
      status: 400,
      body: {
        success: false,
        message: "name, email, and password are required",
      },
    };
  }

  if (typeof email !== "string" || !email.trim()) {
    return {
      status: 400,
      body: {
        success: false,
        message: "email must be a non-empty string",
      },
    };
  }

  const passwordError = validatePasswordComplexity(password);
  if (passwordError) {
    return passwordError;
  }

  if (role !== undefined && !USER_ROLES.includes(role)) {
    return {
      status: 400,
      body: {
        success: false,
        message: `Invalid role. Must be one of: ${USER_ROLES.join(", ")}`,
      },
    };
  }

  return null;
};

export const validateLoginInput = (body) => {
  const { email, password } = body ?? {};

  if (!email || !password) {
    return {
      status: 400,
      body: {
        success: false,
        message: "email and password are required",
      },
    };
  }

  return null;
};

export const validateChangePasswordInput = (body) => {
  const { currentPassword, newPassword, confirmNewPassword } = body ?? {};

  if (!currentPassword || !newPassword) {
    return {
      status: 400,
      body: {
        success: false,
        message: "currentPassword and newPassword are required",
      },
    };
  }

  if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
    return {
      status: 400,
      body: {
        success: false,
        message: "confirmNewPassword must match newPassword",
      },
    };
  }

  const passwordError = validatePasswordComplexity(newPassword);
  if (passwordError) {
    return passwordError;
  }

  return null;
};

export const validateUpdateMyProfileInput = (body) => {
  const { name, email } = body ?? {};

  if (name === undefined && email === undefined) {
    return {
      status: 400,
      body: {
        success: false,
        message: "At least one of name or email must be provided",
      },
    };
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return {
        status: 400,
        body: {
          success: false,
          message: "name must be a non-empty string when provided",
        },
      };
    }
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !email.trim()) {
      return {
        status: 400,
        body: {
          success: false,
          message: "email must be a non-empty string when provided",
        },
      };
    }
  }

  return null;
};

export const validateUpdateUserStatusInput = ({ userId, status }) => {
  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "userId is required",
      },
    };
  }

  if (!mongoose.isValidObjectId(userId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid user id",
      },
    };
  }

  if (!status) {
    return {
      status: 400,
      body: {
        success: false,
        message: "status is required",
      },
    };
  }

  if (!USER_STATUSES.includes(status)) {
    return {
      status: 400,
      body: {
        success: false,
        message: `Invalid status. Must be one of: ${USER_STATUSES.join(", ")}`,
      },
    };
  }

  return null;
};

export const validateGetUsersFilters = ({ status, role }) => {
  if (status !== undefined && !USER_STATUSES.includes(status)) {
    return {
      status: 400,
      body: {
        success: false,
        message: `Invalid status. Must be one of: ${USER_STATUSES.join(", ")}`,
      },
    };
  }

  if (role !== undefined && !USER_ROLES.includes(role)) {
    return {
      status: 400,
      body: {
        success: false,
        message: `Invalid role. Must be one of: ${USER_ROLES.join(", ")}`,
      },
    };
  }

  return null;
};
