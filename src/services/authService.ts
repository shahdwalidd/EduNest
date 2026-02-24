import type { RegisterFormData } from '../types/auth';
import api from './api';

// Register mentor
export const registerMentor = async (
  formData: RegisterFormData
) => {
  const response = await api.post('/register-mentor', formData);
  return response.data;
};

<<<<<<< Updated upstream
// Register student
export const registerStudent = async (
  formData: RegisterFormData
) => {
  const response = await api.post('/register-student', formData);
=======
// 2. استخدام Generic Types لضمان دقة البيانات العائدة
// نرمي الخطأ الكامل (مع response) حتى صفحة التسجيل تقرأ status و data
const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  const response = await request;
>>>>>>> Stashed changes
  return response.data;
};

export const sendOtp = async (email: string) => {
  const response = await api.post(
    `/send-otp`,
    null, 
    {
      params: { email }, 
    }
  );

<<<<<<< Updated upstream
  return response.data;
};
=======
// للمينتور لا نرسل educationalLevel (حقل خاص بالطالب فقط)، والباكند يتطلب confirmPassword
function buildMentorPayload(formData: RegisterFormData) {
  const { educationalLevel, ...rest } = formData;
  void confirmPassword;
  void confirmPassword;
  void educationalLevel;
  return rest;
}

export const registerMentor = (formData: RegisterFormData) => 
  handleRequest(api.post(ENDPOINTS.REGISTER_MENTOR, buildMentorPayload(formData)));
>>>>>>> Stashed changes

// Verify OTP code
export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post(
    `/verify-user`,
    { email, otp }
  );

  return response.data;
};

