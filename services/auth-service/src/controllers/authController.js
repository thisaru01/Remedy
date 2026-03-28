import jwt from "jsonwebtoken";
import axios from "axios";
import mongoose from "mongoose";
import User from "../models/userModel.js";

// Generate JWT
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

// Register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
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
        return res.status(500).json({
          success: false,
          message: "PATIENT_SERVICE_URL is not configured",
        });
      }

      if (!internalToken) {
        await user.deleteOne();
        return res.status(500).json({
          success: false,
          message: "INTERNAL_SERVICE_TOKEN is not configured",
        });
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
        return res.status(502).json({
          success: false,
          message: "Failed to create patient profile",
        });
      }
    }

    if (user.role === "doctor") {
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL;
      const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

      if (!doctorServiceUrl) {
        await user.deleteOne();
        return res.status(500).json({
          success: false,
          message: "DOCTOR_SERVICE_URL is not configured",
        });
      }

      if (!internalToken) {
        await user.deleteOne();
        return res.status(500).json({
          success: false,
          message: "INTERNAL_SERVICE_TOKEN is not configured",
        });
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
        return res.status(502).json({
          success: false,
          message: "Failed to create doctor profile",
        });
      }
    }

    const token = generateToken(user);

    return res.status(201).json({
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
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
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
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Activate/Deactivate account
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const allowedStatuses = ["active", "inactive"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        profilePhoto: updatedUser.profilePhoto,
      },
    });
  } catch (error) {
    next(error);
  }
};
