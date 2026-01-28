import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import authAPI from "../../api/auth.api";
import userAPI from "../../api/user.api";
import useAuthStore from "../../store/authStore";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { SERVER_URL } from "../../utils/constants";
import confirmDialog from "../../utils/confirmDialog.jsx";
import UserOrdersTab from "../../components/user/UserOrdersTab";

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const { user, clearUser, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      clearUser();
      navigate("/login");
    },
    onError: () => {
      // Still clear user even if API call fails
      clearUser();
      navigate("/login");
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: authAPI.logoutAllDevices,
    onSuccess: () => {
      toast.success("Successfully logged out from all devices");
      clearUser();
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to logout from all devices");
      // Even on error, clear local state for security
      clearUser();
      navigate("/login");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (response) => {
      setUser(response.data.user);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to update profile");
      setSuccess("");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: userAPI.uploadProfileImage,
    onSuccess: (response) => {
      setUser(response.data.user);
      setSuccess("Profile image updated successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to upload image");
      setSuccess("");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: userAPI.deleteProfileImage,
    onSuccess: (response) => {
      setUser(response.data.user);
      setSuccess("Profile image removed successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to remove image");
      setSuccess("");
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("File too large. Maximum size is 2MB.");
      return;
    }

    uploadImageMutation.mutate(file);
  };

  const handleDeleteImage = async () => {
    const confirmed = await confirmDialog(
      "Are you sure you want to remove your profile image?",
      {
        confirmText: "Remove",
        type: "danger",
      },
    );
    if (confirmed) {
      deleteImageMutation.mutate();
    }
  };

  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    return user.profileImage.startsWith("/")
      ? `${SERVER_URL}${user.profileImage}`
      : user.profileImage;
  };

  const handleLogout = async () => {
    const confirmed = await confirmDialog("Are you sure you want to logout?", {
      confirmText: "Logout",
      type: "warning",
    });
    if (confirmed) {
      logoutMutation.mutate();
    }
  };

  const handleLogoutAll = async () => {
    const confirmed = await confirmDialog(
      "This will log you out from all devices, including this one. Continue?",
      {
        confirmText: "Logout All",
        type: "danger",
      },
    );
    if (confirmed) {
      logoutAllMutation.mutate();
    }
  };

  const handleEditClick = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return;
    }

    updateProfileMutation.mutate({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim() || null,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === "profile"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                    }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === "security"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                    }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === "orders"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                    }`}
                >
                  My Orders
                </button>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-8 pb-6 border-b">
                  <div className="relative">
                    {getProfileImageUrl() ? (
                      <img
                        src={getProfileImageUrl()}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </div>
                    )}
                    {(uploadImageMutation.isPending ||
                      deleteImageMutation.isPending) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadImageMutation.isPending}
                      className="btn-secondary text-sm"
                    >
                      {user?.profileImage ? "Change Photo" : "Upload Photo"}
                    </button>
                    {user?.profileImage && (
                      <button
                        onClick={handleDeleteImage}
                        disabled={deleteImageMutation.isPending}
                        className="btn-secondary text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Max 2MB. JPEG, PNG, GIF, or WebP.
                  </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={handleEditClick}
                      className="btn-secondary text-sm"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {isEditing ? (
                  <form onSubmit={handleSubmitProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="input-field bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter phone number (optional)"
                      />
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="btn-primary flex items-center"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Saving...</span>
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-secondary"
                        disabled={updateProfileMutation.isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="input-field bg-gray-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={user?.firstName || ""}
                          disabled
                          className="input-field bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={user?.lastName || ""}
                          disabled
                          className="input-field bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={user?.phone || "Not provided"}
                        disabled
                        className="input-field bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role || ""}
                        disabled
                        className="input-field bg-gray-50 capitalize"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Security Settings</h2>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your password regularly to keep your account
                      secure.
                    </p>
                    <button
                      onClick={() => navigate("/change-password")}
                      className="btn-primary"
                    >
                      Change Password
                    </button>
                  </div>

                  {/* TOTP-Based MFA */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      TOTP-Based Multi-Factor Authentication
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-3">
                        🔒 Enhance your account security with time-based
                        one-time passwords using an authenticator app
                      </p>
                      <button
                        onClick={() => navigate("/security")}
                        className="btn-primary"
                      >
                        Manage TOTP MFA
                      </button>
                    </div>
                  </div>

                  {/* Device Management */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-red-600 mb-4">
                      Device Management
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Lost a device or suspect unauthorized access? You can log
                      out from all devices and browser sessions associated with
                      your account.
                    </p>
                    <button
                      onClick={handleLogoutAll}
                      disabled={logoutAllMutation.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                    >
                      {logoutAllMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Logging out everywhere...</span>
                        </>
                      ) : (
                        "Logout from All Devices"
                      )}
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Note: This will also end your current session.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && <UserOrdersTab />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
