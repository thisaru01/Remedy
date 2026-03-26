import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/userModel.js";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
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

// Verify Token (called by other services to validate a user's JWT)
export const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    return res.status(200).json({
      success: true,
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
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
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
