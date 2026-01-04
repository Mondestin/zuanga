import { UserModel, UserRole, CreateUserInput, User } from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../auth/password';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../auth/jwt';

export interface RegisterInput {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  license_number?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_plate_number?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  tokens: AuthTokens;
}

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if email already exists
    if (await UserModel.emailExists(input.email)) {
      throw new Error('Email already registered');
    }

    // Check if phone already exists
    if (await UserModel.phoneExists(input.phone)) {
      throw new Error('Phone number already registered');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    // Only include vehicle/license fields if role is DRIVER
    const userInput: CreateUserInput = {
      email: input.email,
      phone: input.phone,
      password: input.password,
      first_name: input.first_name,
      last_name: input.last_name,
      role: input.role,
      // Only set vehicle/license fields for drivers
      license_number: input.role === UserRole.DRIVER ? input.license_number : undefined,
      vehicle_make: input.role === UserRole.DRIVER ? input.vehicle_make : undefined,
      vehicle_model: input.role === UserRole.DRIVER ? input.vehicle_model : undefined,
      vehicle_color: input.role === UserRole.DRIVER ? input.vehicle_color : undefined,
      vehicle_plate_number: input.role === UserRole.DRIVER ? input.vehicle_plate_number : undefined,
    };

    const user = await UserModel.create(userInput, passwordHash);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    return {
      user: userResponse,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  /**
   * Login user
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await UserModel.findByEmail(input.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(input.password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    return {
      user: userResponse,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Get user to ensure they still exist and are active
    const user = await UserModel.findById(decoded.userId);

    if (!user || !user.is_active) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: accessToken,
    };
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash, ...userResponse } = user;
    return userResponse;
  }
}

