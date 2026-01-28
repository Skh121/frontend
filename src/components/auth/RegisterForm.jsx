import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { FiLock, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import authAPI from "../../api/auth.api";
import LoadingSpinner from "../common/LoadingSpinner";
import PasswordStrengthMeter from "../common/PasswordStrengthMeter";
import GoogleLoginButton from "./GoogleLoginButton";
import heroBg from "../../assets/hero-bg.png";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: (data) => authAPI.register(data),
    onSuccess: (response) => {
      setSuccess(true);
      setError("");

      // Extract PIN from development mode message
      const devMessage = response.data?.message;
      const pinMatch = devMessage?.match(/PIN is (\d{6})/);
      const devPin = pinMatch ? pinMatch[1] : null;

      // Redirect to verification page with email and PIN
      setTimeout(() => {
        navigate("/verify-email", {
          state: {
            email: response.data.email,
            devPin: devPin,
          },
        });
      }, 1500);
    },
    onError: (error) => {
      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again.",
      );
    },
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Validate password strength
      if (formData.password.length < 12) {
        setError("Password must be at least 12 characters long");
        return;
      }

      if (!/[A-Z]/.test(formData.password)) {
        setError("Password must contain at least one uppercase letter");
        return;
      }

      if (!/[a-z]/.test(formData.password)) {
        setError("Password must contain at least one lowercase letter");
        return;
      }

      if (!/\d/.test(formData.password)) {
        setError("Password must contain at least one number");
        return;
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
        setError("Password must contain at least one special character");
        return;
      }

      let captchaToken = "dev_token"; // Default for development

      // Get reCAPTCHA token if available
      if (executeRecaptcha) {
        try {
          captchaToken = await executeRecaptcha("register");
        } catch (err) {
          console.error("reCAPTCHA error:", err);
          setError("CAPTCHA verification failed. Please try again.");
          return;
        }
      }

      registerMutation.mutate({ ...formData, captchaToken });
    },
    [executeRecaptcha, formData, registerMutation],
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Link to="/" className="flex justify-center mb-6">
            <span className="text-4xl font-bold text-blue-600 hover:scale-105 transition-transform duration-300">
              🛍️ ShopSecure
            </span>
          </Link>
          <div className="card text-center animate-fade-in py-12 shadow-xl">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-8 max-w-xs mx-auto">
              We've sent a 6-digit PIN to your email. Please check your inbox.
            </p>
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">
              Redirecting to verification...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img
          src={heroBg}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Abstract background"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
          <Link
            to="/"
            className="text-3xl font-bold flex items-center gap-2 w-fit"
          >
            <span>🛍️</span> ShopSecure
          </Link>

          <div className="mb-12 space-y-6 max-w-lg">
            <h1 className="text-4xl font-bold leading-tight">
              Join the future of secure shopping
            </h1>
            <p className="text-lg text-slate-300">
              Create an account to track orders, save your wishlist, and get
              personalized recommendations.
            </p>

            <ul className="space-y-4 mt-8">
              <li className="flex items-center gap-3 text-slate-200">
                <div className="p-1 rounded-full bg-blue-500/20">
                  <FiCheck className="w-4 h-4 text-blue-400" />
                </div>
                Exclusive Member Deals
              </li>
              <li className="flex items-center gap-3 text-slate-200">
                <div className="p-1 rounded-full bg-purple-500/20">
                  <FiCheck className="w-4 h-4 text-purple-400" />
                </div>
                Faster Checkout
              </li>
              <li className="flex items-center gap-3 text-slate-200">
                <div className="p-1 rounded-full bg-emerald-500/20">
                  <FiCheck className="w-4 h-4 text-emerald-400" />
                </div>
                Order History & Tracking
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24 bg-white overflow-y-auto h-screen">
        <div className="lg:hidden mb-12 text-center">
          <Link
            to="/"
            className="text-3xl font-bold text-blue-600 inline-flex items-center gap-2"
          >
            <span>🛍️</span> ShopSecure
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in lg:my-auto">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm">
                <p className="font-medium">Registration Failed</p>
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field mt-1 pr-10"
                    placeholder="Enter a strong password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-hidden"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field mt-1 pr-10"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-hidden"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="btn-primary w-full flex justify-center items-center py-3 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                {registerMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleLoginButton onError={(msg) => setError(msg)} />
          </form>

          <p className="text-center text-xs text-gray-500 mt-8 pb-4">
            Protected by reCAPTCHA and subject to Google's{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>{" "}
            &{" "}
            <a href="#" className="underline">
              Terms
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
