import {
  registerUser,
  loginUser,
  updateUserStatusService,
  getUsersService,
} from "../services/authService.js";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../validation/authValidation.js";

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
