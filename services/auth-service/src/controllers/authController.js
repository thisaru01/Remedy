import {
  registerUser,
  loginUser,
  updateUserStatusService,
  getUsersService,
  changeMyPasswordService,
} from "../services/authService.js";
import {
  validateLoginInput,
  validateRegisterInput,
  validateChangePasswordInput,
} from "../validation/authValidation.js";
import { getMyProfileService } from "../services/authService.js";

// Register
export const register = async (req, res, next) => {
  try {
    const validationError = validateRegisterInput(req.body);
    if (validationError) {
      return res.status(validationError.status).json(validationError.body);
    }

    const result = await registerUser(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const validationError = validateLoginInput(req.body);
    if (validationError) {
      return res.status(validationError.status).json(validationError.body);
    }

    const result = await loginUser(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Admin: Activate/Deactivate account
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const result = await updateUserStatusService({ userId, status });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users (optional query filters: ?status=active|inactive&role=patient|doctor|admin)
export const getUsers = async (req, res, next) => {
  try {
    const { status, role } = req.query ?? {};
    const result = await getUsersService({ status, role });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Change password for the currently authenticated user
export const changeMyPassword = async (req, res, next) => {
  try {
    const validationError = validateChangePasswordInput(req.body);
    if (validationError) {
      return res.status(validationError.status).json(validationError.body);
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    const result = await changeMyPasswordService({
      userId,
      currentPassword,
      newPassword,
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Get profile for the currently authenticated user
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const result = await getMyProfileService({ userId });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
