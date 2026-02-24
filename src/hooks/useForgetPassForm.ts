import { useState } from "react";

interface ForgetPassFormData {
  email: string;
}

interface ForgetPassErrors {
  email?: string;
}

export const useForgetPassForm = () => {
  const [formData, setFormData] = useState<ForgetPassFormData>({ email: "" });
  const [errors, setErrors] = useState<ForgetPassErrors>({});
  const [loading, setLoading] = useState(false);

  const emailRegex = /^\S+@\S+\.\S+$/;

  const validate = (): boolean => {
    const newErrors: ForgetPassErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ForgetPassFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

<<<<<<< Updated upstream
=======
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await forgetPassword(formData.email);
      toast.success("Verification code sent to your email.");

      navigate("/check-email", { state: { email: formData.email } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const backendMessage =
      error?.response?.data?.errorMessages?.["User Search"] || 
      error?.response?.data?.message || 
      error?.message || 
        "Something went wrong while sending reset email.";

      toast.error(backendMessage);
      console.error("Forget password error:", error);
    } finally {
      setLoading(false);
    }
  };

>>>>>>> Stashed changes
  return {
    formData,
    errors,
    loading,
    setLoading,
    validate,
    handleInputChange,
  };
};
