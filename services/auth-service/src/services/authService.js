import jwt from "jsonwebtoken";
import axios from "axios";
import mongoose from "mongoose";
import User from "../models/userModel.js";

const USER_STATUSES = ["active", "inactive"];
const USER_ROLES = ["patient", "doctor", "admin"];

// Generate a JWT for the given user
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    },
  );
};

// Build a standardized user response object
const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  profilePhoto: user.profilePhoto,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Register a new user and create related patient/doctor profile if needed
export const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return {
      status: 400,
      body: {
        success: false,
        message: "User already exists",
      },
    };
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user.role === "patient") {
    const patientServiceUrl = process.env.PATIENT_SERVICE_URL;
    const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

    if (!patientServiceUrl) {
      await user.deleteOne();
      return {
        status: 500,
        body: {
          success: false,
          message: "PATIENT_SERVICE_URL is not configured",
        },
      };
    }

    if (!internalToken) {
      await user.deleteOne();
      return {
        status: 500,
        body: {
          success: false,
          message: "INTERNAL_SERVICE_TOKEN is not configured",
        },
      };
    }

    try {
      await axios.post(
        `${patientServiceUrl.replace(/\/$/, "")}/api/patient-profiles`,
        { userId: user._id },
        {
          headers: {
            "x-internal-token": internalToken,
          },
          timeout: 5000,
        },
      );
    } catch (serviceError) {
      await user.deleteOne();
      return {
        status: 502,
        body: {
          success: false,
          message: "Failed to create patient profile",
        },
      };
    }
  }

  if (user.role === "doctor") {
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL;
    const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

    if (!doctorServiceUrl) {
      await user.deleteOne();
      return {
        status: 500,
        body: {
          success: false,
          message: "DOCTOR_SERVICE_URL is not configured",
        },
      };
    }

    if (!internalToken) {
      await user.deleteOne();
      return {
        status: 500,
        body: {
          success: false,
          message: "INTERNAL_SERVICE_TOKEN is not configured",
        },
      };
    }

    try {
      await axios.post(
        `${doctorServiceUrl.replace(/\/$/, "")}/api/doctor-profiles`,
        { userId: user._id },
        {
          headers: {
            "x-internal-token": internalToken,
          },
          timeout: 5000,
        },
      );
    } catch (serviceError) {
      await user.deleteOne();
      return {
        status: 502,
        body: {
          success: false,
          message: "Failed to create doctor profile",
        },
      };
    }
  }

  const token = generateToken(user);

  return {
    status: 201,
    body: {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
      },
    },
  };
};

// Authenticate a user with email and password
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Invalid credentials",
      },
    };
  }

  if (user.status !== "active") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Account is inactive",
      },
    };
  }

  const token = generateToken(user);

  return {
    status: 200,
    body: {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
      },
    },
  };
};

// Update the status (active/inactive) of a user
export const updateUserStatusService = async ({ userId, status }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid user id",
      },
    };
  }

  const allowedStatuses = ["active", "inactive"];
  if (!status || !allowedStatuses.includes(status)) {
    return {
      status: 400,
      body: {
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      },
    };
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    return {
      status: 404,
      body: {
        success: false,
        message: "User not found",
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        profilePhoto: updatedUser.profilePhoto,
      },
    },
  };
};

// Retrieve users with optional status and role filters
export const getUsersService = async ({ status, role }) => {
  const filter = {};

  if (status !== undefined) {
    if (!USER_STATUSES.includes(status)) {
      return {
        status: 400,
        body: {
          success: false,
          message: `Invalid status. Must be one of: ${USER_STATUSES.join(", ")}`,
        },
      };
    }
    filter.status = status;
  }

  if (role !== undefined) {
    if (!USER_ROLES.includes(role)) {
      return {
        status: 400,
        body: {
          success: false,
          message: `Invalid role. Must be one of: ${USER_ROLES.join(", ")}`,
        },
      };
    }
    filter.role = role;
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  return {
    status: 200,
    body: {
      success: true,
      count: users.length,
      users: users.map((u) => buildUserResponse(u)),
    },
  };
};
