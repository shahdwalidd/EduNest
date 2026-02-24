import React, { useState } from "react";
import type { LoginFormData, FormErrors } from "../types/auth";
<<<<<<< Updated upstream
=======
import { loginUser, sendOtp } from "../services/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getFirstNameFromToken, getFirstNameFromUser } from "../utils/jwt";
>>>>>>> Stashed changes

export const useLogin = () => {
  const [formData, setFormData] = useState<LoginFormData>({ 
    email: "", 
    password: "",
    rememberMe: false 
  });
  
  const [errors, setErrors] = useState<FormErrors>({}); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
<<<<<<< Updated upstream
      console.log("Logging in with:", formData);
      // هنا سيتم استدعاء الـ AuthService لاحقاً
=======
      console.log('🔍 Attempting login with:', formData.email);
      const data = await loginUser(formData.email, formData.password);
      console.log('✅ Login response:', data);

      // جرّب عدة طرق للوصول للـ JWT
      const jwt = data?.apiResponse?.jwt 
        || data?.jwt 
        || data?.token 
        || (data?.apiResponse as Record<string, unknown>)?.token;
      
      const statusMessage = data?.apiResponse?.status 
        || data?.status 
        || data?.message 
        || "Logged in successfully!";

      console.log('🔑 JWT found:', jwt ? '✅ YES' : '❌ NO');
      console.log('📝 Status message:', statusMessage);
      console.log('📊 Full data:', JSON.stringify(data, null, 2));

      if (jwt) {
        toast.success(statusMessage);
        
        // جرّب عدة طرق للوصول للـ user data
        const apiRes = data?.apiResponse as Record<string, unknown> | undefined;
        const user = (apiRes?.user ?? data?.user) as Record<string, unknown> | undefined;
        
        let userName = getFirstNameFromUser(user);
        if (!userName) userName = getFirstNameFromToken(jwt);
        if (!userName && user) {
          const full = String(user.name ?? user.fullName ?? user.full_name ?? user.firstName ?? user.first_name ?? '');
          userName = full.trim().split(/\s+/)[0] || '';
        }
        
        console.log('💾 Saving auth with token:', jwt);
        console.log('👤 User name:', userName);
        console.log('🔖 Remember Me:', formData.rememberMe);
        
        // حفظ التوكن والبيانات
        useAuthStore.getState().setAuth({
          token: jwt,
          userName: userName || (user?.email ? String(user.email).split('@')[0] : ''),
          userEmail: (user?.email ? String(user.email) : formData.email) ?? formData.email,
          userRole: (user?.role ? String(user.role) : '') ?? '',
          rememberMe: formData.rememberMe,
        });
        
        // تحقق من الحفظ
        const stored = useAuthStore.getState().token;
        console.log('✅ Token stored:', stored ? '✅ YES' : '❌ NO', stored);
        
        // انتظر قليلاً قبل الـ navigate للتأكد من حفظ البيانات
        setTimeout(() => {
          navigate("/mentor/dashboard");
        }, 100);
        
      } else {
        const errorMsg = statusMessage || "Login failed. Please check your credentials.";
        toast.error(errorMsg);
        console.error("❌ No JWT in response:", data);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Login error:", error);
      const errorData = error.response?.data;
      const rawMsg = errorData?.errorMessages?.error 
        || errorData?.errorMessages?.['Email Error']
        || errorData?.message 
        || (errorData?.errorMessages && Object.values(errorData.errorMessages)[0]);
      const errorText = (typeof rawMsg === 'string' ? rawMsg : String(rawMsg || '')).toLowerCase();

      // حساب موجود لكن غير مفعّل → توجيه لصفحة OTP لإكمال التفعيل
      const isUnverifiedAccount =
        errorText.includes('not verified') ||
        errorText.includes('unverified') ||
        errorText.includes('request a new otp') ||
        errorText.includes('request new otp');

      if (isUnverifiedAccount) {
        try {
          localStorage.setItem("registrationEmail", formData.email);
          await sendOtp(formData.email);
          toast.success("A new verification code has been sent to your email. Complete verification to continue.");
          navigate("/verify");
        } catch (otpErr) {
          console.error("OTP Error:", otpErr);
          toast.error("Failed to send the code. Please try again.");
        }
        return;
      }

      const backendMessage = rawMsg || "Something went wrong";
      toast.error(backendMessage);
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    showPassword,
    setShowPassword,
    handleInputChange,
    handleSubmit,
  };
};