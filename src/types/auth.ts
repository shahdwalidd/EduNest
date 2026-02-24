

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  educationalLevel?: string;
  agreeTerms?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  educationalLevel?: string;
  agreeTerms?: string;
  rememberMe?: string;
  general?: string;
}

export type JoinAs = "mentor" | "student";

<<<<<<< Updated upstream
=======
// --- API Responses ---

// هيكل بيانات المستخدم
export interface UserData {
  id?: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  phone_number?: string;
  [key: string]: unknown;
}

// الـ apiResponse الداخلي
export interface ApiResponseData {
  jwt?: string;
  token?: string;
  status?: string;
  message?: string;
  user?: UserData;
  [key: string]: unknown;
}

// الشكل النهائي لريسبونس الـ BE
export interface AuthResponse {
  apiResponse?: ApiResponseData;
  jwt?: string;
  token?: string;
  status?: string;
  message?: string;
  user?: UserData;
  [key: string]: unknown;
}

>>>>>>> Stashed changes
