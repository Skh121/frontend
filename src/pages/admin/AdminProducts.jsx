import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminAPI from "../../api/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  SERVER_URL,
} from "../../utils/constants";
import confirmDialog from "../../utils/confirmDialog.jsx";

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "electronics",
    stock: "",
    isActive: true,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () => adminAPI.getAllProducts({ page, limit: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: adminAPI.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setIsModalOpen(false);
      resetForm();
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setIsModalOpen(false);
      resetForm();
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination || {};

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "electronics",
      stock: "",
      isActive: true,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setFormErrors({});
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog(
      "Are you sure you want to delete this product?",
      {
        confirmText: "Delete",
        type: "danger",
      },
    );
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      isActive: product.isActive,
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.price = "Valid price is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      errors.stock = "Valid stock quantity is required";
    if (!formData.category) errors.category = "Category is required";

    // Check for images - either new files or existing images
    if (imageFiles.length === 0 && existingImages.length === 0) {
      errors.images = "At least one product image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("description", formData.description.trim());
    submitData.append("price", formData.price);
    submitData.append("category", formData.category);
    submitData.append("stock", formData.stock);
    submitData.append("isActive", formData.isActive);

    // Append new image files
    imageFiles.forEach((file) => {
      submitData.append("images", file);
    });

    // Append existing images to keep (for edit mode)
    if (existingImages.length > 0) {
      submitData.append("keepExistingImages", JSON.stringify(existingImages));
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Product Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Add New Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            product.images?.[0]?.startsWith("/")
                              ? `${SERVER_URL}${product.images[0]}`
                              : product.images?.[0] || "/placeholder.png"
                          }
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover border border-gray-200"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {CATEGORY_LABELS[product.category]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900 font-semibold"
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-auto my-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.name ? "border-red-500" : ""}`}
                  placeholder="Enter product name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="input-field"
                  placeholder="Enter product description"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`input-field ${formErrors.price ? "border-red-500" : ""}`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={`input-field ${formErrors.stock ? "border-red-500" : ""}`}
                    placeholder="0"
                  />
                  {formErrors.stock && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.stock}
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.category ? "border-red-500" : ""}`}
                >
                  {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {CATEGORY_LABELS[value]}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images <span className="text-red-500">*</span>
                </label>

                {/* Existing Images (only in edit mode) */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Current Images:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={
                              img.startsWith("/") ? `${SERVER_URL}${img}` : img
                            }
                            alt={`Product ${index + 1}`}
                            className="h-20 w-20 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setExistingImages(
                                existingImages.filter((_, i) => i !== index),
                              );
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      New Images to Upload:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreviews(
                                imagePreviews.filter((_, i) => i !== index),
                              );
                              setImageFiles(
                                imageFiles.filter((_, i) => i !== index),
                              );
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Input */}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const totalImages =
                      existingImages.length + imageFiles.length + files.length;

                    if (totalImages > 10) {
                      toast.error("Maximum 10 images allowed");
                      return;
                    }

                    // Create previews
                    const newPreviews = files.map((file) =>
                      URL.createObjectURL(file),
                    );
                    setImagePreviews([...imagePreviews, ...newPreviews]);
                    setImageFiles([...imageFiles, ...files]);

                    // Clear error
                    if (formErrors.images) {
                      setFormErrors((prev) => ({ ...prev, images: "" }));
                    }
                  }}
                  className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload up to 10 images. Supported formats: JPEG, PNG, GIF,
                  WebP. Max 5MB each.
                </p>
                {formErrors.images && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.images}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Product is active and visible to customers
                </label>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="btn-primary flex-1 flex justify-center items-center py-3"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">
                        {editingProduct ? "Updating..." : "Creating..."}
                      </span>
                    </>
                  ) : (
                    <span>
                      {editingProduct ? "Update Product" : "Create Product"}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
