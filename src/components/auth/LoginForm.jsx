import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import { FiLock, FiShield, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import authAPI from "../../api/auth.api";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import LoadingSpinner from "../common/LoadingSpinner";
import GoogleLoginButton from "./GoogleLoginButton";
import heroBg from "../../assets/hero-bg.png";

const LoginForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const { clearCart } = useCartStore();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [requiresTOTP, setRequiresTOTP] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data) =>
      authAPI.login(data.email, data.password, data.captchaToken),
    onSuccess: (response) => {
      if (response.requires2FA) {
        setRequires2FA(true);
        setError("");
      } else if (response.requiresTOTP) {
        setRequiresTOTP(true);
        setError("");
      } else {
        // CRITICAL: Clear previous session data before setting new user
        queryClient.clear(); // Clear all cached data from previous session
        clearCart(); // Clear cart from previous session
        const userRole = response.data.user.role;
        setUser(response.data.user);

        if (userRole && userRole.toLowerCase() === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    },
    onError: (error) => {
      setError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    },
  });

  const totpMutation = useMutation({
    mutationFn: () =>
      authAPI.verifyTOTPLogin(formData.email, totpCode, useBackupCode),
    onSuccess: (response) => {
      // CRITICAL: Clear previous session data before setting new user
      queryClient.clear(); // Clear all cached data from previous session
      clearCart(); // Clear cart from previous session
      setUser(response.data.user);
      if (response.data.backupCodesRemaining !== undefined) {
        toast.success(
          `Backup code accepted. You have ${response.data.backupCodesRemaining} backup codes remaining.`,
        );
      }
      if (
        response.data.user.role &&
        response.data.user.role.toLowerCase() === "admin"
      ) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    },
    onError: (error) => {
      setError(
        error.response?.data?.message || "Invalid TOTP code. Please try again.",
      );
    },
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      let captchaToken = "dev_token"; // Default for development

      // Get reCAPTCHA token if available
      if (executeRecaptcha) {
        try {
          captchaToken = await executeRecaptcha("login");
        } catch (err) {
          console.error("reCAPTCHA error:", err);
          setError("CAPTCHA verification failed. Please try again.");
          return;
        }
      }

      loginMutation.mutate({ ...formData, captchaToken });
    },
    [executeRecaptcha, formData, loginMutation],
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTOTPSubmit = (e) => {
    e.preventDefault();
    setError("");
    const expectedLength = useBackupCode ? 9 : 6;
    if (!totpCode || totpCode.length !== expectedLength) {
      setError(`Please enter a valid ${expectedLength}-character code`);
      return;
    }
    totpMutation.mutate();
  };

  // Render Form Content
  const renderFormContent = () => {
    if (requiresTOTP) {
      return (
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleTOTPSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="totpCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {useBackupCode ? "Backup Code" : "Authenticator Code"}
              </label>
              <input
                id="totpCode"
                name="totpCode"
                type="text"
                required
                maxLength={useBackupCode ? 9 : 6}
                value={totpCode}
                onChange={(e) => {
                  const val = e.target.value;
                  if (useBackupCode) {
                    // Allow alphanumeric and hyphen, auto-capitalize
                    setTotpCode(val.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase());
                  } else {
                    // Numbers only for TOTP
                    setTotpCode(val.replace(/\D/g, ""));
                  }
                }}
                className={`input-field text-center font-mono h-14 ${useBackupCode
                  ? "text-xl tracking-widest"
                  : "text-3xl tracking-[0.5em]"
                  }`}
                placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
                autoFocus
              />
            </div>

            <div className="flex items-center">
              <input
                id="useBackupCode"
                name="useBackupCode"
                type="checkbox"
                checked={useBackupCode}
                onChange={(e) => {
                  setUseBackupCode(e.target.checked);
                  setTotpCode("");
                  setError("");
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="useBackupCode"
                className="ml-2 block text-sm text-gray-900"
              >
                Use backup code instead
              </label>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={totpMutation.isPending}
                className="btn-primary w-full flex justify-center items-center py-3"
              >
                {totpMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Verifying...</span>
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequiresTOTP(false);
                  setTotpCode("");
                  setError("");
                  setUseBackupCode(false);
                }}
                className="w-full text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                ← Back to login
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (requires2FA) {
      return (
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
              Enter 2FA Code
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              A verification code has been sent to your email
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              2FA verification component to be implemented. Email:{" "}
              {formData.email}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Start for free
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm">
              <p className="font-medium">Login Failed</p>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-5">
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
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field mt-1 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-hidden"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900 cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full flex justify-center items-center py-3 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              {loginMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                "Sign in"
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

        <p className="text-center text-xs text-gray-500 mt-8">
          Protected by reCAPTCHA and subject to the Google{" "}
          <a
            href="https://policies.google.com/privacy"
            className="underline hover:text-gray-900"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://policies.google.com/terms"
            className="underline hover:text-gray-900"
          >
            Terms of Service
          </a>
          .
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img
          src={heroBg}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Login Background"
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
              Secure access to your enterprise commerce platform
            </h1>
            <p className="text-lg text-slate-300">
              Manage your orders, track shipments, and shop with confidence
              knowing your data is protected by industry-leading security.
            </p>

            <div className="flex gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <div className="p-1 rounded-full bg-emerald-500/20">
                  <FiCheck className="w-4 h-4 text-emerald-400" />
                </div>
                End-to-End Encryption
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <div className="p-1 rounded-full bg-blue-500/20">
                  <FiShield className="w-4 h-4 text-blue-400" />
                </div>
                24/7 Threat Monitoring
              </div>
            </div>
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

        <div className="mx-auto w-full max-w-sm lg:w-96 lg:my-auto">
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
