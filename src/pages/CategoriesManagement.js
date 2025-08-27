import React, { useState, useEffect } from "react";
import callAPI from "../services/callAPI";
import { useTheme } from "../contexts/ThemeContext";
import {
  FolderIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  FolderOpenIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const CategoriesManagement = () => {
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showParentOnly, setShowParentOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
    icon: "default-icon",
    color: "#3B82F6",
    isActive: true,
    featured: false,
    sortOrder: 0,
  });
  const [parentCategories, setParentCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await callAPI.get("/api/admin/categories");

      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await callAPI.get(
        "/api/admin/categories?parentCategory=null"
      );
      if (response.data.success) {
        setParentCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  const handleCreateCategory = () => {
    setFormData({
      name: "",
      description: "",
      parentCategory: "", // Empty string will be converted to null on submit
      icon: "default-icon",
      color: "#3B82F6",
      isActive: true,
      featured: false,
      sortOrder: 0,
    });
    setModalType("create");
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
      parentCategory: category.parentCategory?._id || "",
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      featured: category.featured,
      sortOrder: category.sortOrder,
    });
    setSelectedCategory(category);
    setModalType("edit");
    setShowModal(true);
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setModalType("view");
    setShowModal(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setModalType("delete");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data - handle empty parentCategory
      const submitData = { ...formData };
      if (submitData.parentCategory === "") {
        submitData.parentCategory = null;
      }

      let response;
      if (modalType === "create") {
        response = await callAPI.post("/api/admin/categories", submitData);
      } else if (modalType === "edit") {
        response = await callAPI.put(
          `/api/admin/categories/${selectedCategory._id}`,
          submitData
        );
      }

      if (response.data.success) {
        toast.success(
          `Category ${
            modalType === "create" ? "created" : "updated"
          } successfully`
        );
        setShowModal(false);
        fetchCategories();
        fetchParentCategories();
      }
    } catch (error) {
      console.error(
        `Error ${modalType === "create" ? "creating" : "updating"} category:`,
        error
      );
      toast.error(
        `Failed to ${modalType === "create" ? "create" : "update"} category`
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await callAPI.delete(
        `/api/admin/categories/${selectedCategory._id}`
      );

      if (response.data.success) {
        toast.success("Category deleted successfully");
        setShowModal(false);
        fetchCategories();
        fetchParentCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesParentFilter = !showParentOnly || !category.parentCategory;

    return matchesSearch && matchesParentFilter;
  });

  const getCategoryIcon = (category) => {
    return category.parentCategory ? (
      <TagIcon className="h-5 w-5 text-blue-500" />
    ) : (
      <FolderIcon className="h-5 w-5 text-purple-500" />
    );
  };

  const getStatusBadge = (category) => {
    const badges = [];

    if (!category.isActive) {
      badges.push(
        <span
          key="inactive"
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
            isDarkMode
              ? "bg-red-900/30 text-red-400 border border-red-700"
              : "bg-red-100 text-red-800"
          }`}
        >
          Inactive
        </span>
      );
    } else {
      badges.push(
        <span
          key="active"
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
            isDarkMode
              ? "bg-green-900/30 text-green-400 border border-green-700"
              : "bg-green-100 text-green-800"
          }`}
        >
          Active
        </span>
      );
    }

    if (category.featured) {
      badges.push(
        <span
          key="featured"
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
            isDarkMode
              ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          Featured
        </span>
      );
    }

    return badges;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 transition-colors duration-300 ${
            isDarkMode ? "border-primary-400" : "border-primary-600"
          }`}
        ></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="mb-2 lg:mb-0">
            <h1
              className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Categories Management
            </h1>
            <p
              className={`transition-colors duration-300 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Manage consultation categories and subcategories
            </p>
          </div>
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 transition-all duration-200 hover:scale-105"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div
          className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
              : "bg-white shadow-gray-200/50"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
              }`}
            >
              <FolderIcon
                className={`h-6 w-6 transition-colors duration-300 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div className="ml-4">
              <p
                className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Total Categories
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
              : "bg-white shadow-gray-200/50"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
              }`}
            >
              <FolderOpenIcon
                className={`h-6 w-6 transition-colors duration-300 ${
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
            </div>
            <div className="ml-4">
              <p
                className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Parent Categories
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {categories.filter((c) => !c.parentCategory).length}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
              : "bg-white shadow-gray-200/50"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode ? "bg-green-900/30" : "bg-green-100"
              }`}
            >
              <TagIcon
                className={`h-6 w-6 transition-colors duration-300 ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              />
            </div>
            <div className="ml-4">
              <p
                className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Subcategories
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {categories.filter((c) => c.parentCategory).length}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
              : "bg-white shadow-gray-200/50"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
              }`}
            >
              <FolderIcon
                className={`h-6 w-6 transition-colors duration-300 ${
                  isDarkMode ? "text-yellow-400" : "text-yellow-600"
                }`}
              />
            </div>
            <div className="ml-4">
              <p
                className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Active Categories
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {categories.filter((c) => c.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div
        className={`rounded-lg shadow-lg mb-6 transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
            : "bg-white shadow-gray-200/50"
        }`}
      >
        <div
          className={`p-6 border-b transition-colors duration-300 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon
                  className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="parentOnly"
                checked={showParentOnly}
                onChange={(e) => setShowParentOnly(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="parentOnly"
                className={`ml-2 text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Show parent categories only
              </label>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead
              className={`transition-colors duration-300 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Category
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Type
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Parent
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Order
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-800 divide-gray-700"
                  : "bg-white divide-gray-200"
              }`}
            >
              {filteredCategories.map((category) => (
                <tr
                  key={category._id}
                  className={`transition-colors duration-300 ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getCategoryIcon(category)}
                      </div>
                      <div className="ml-4">
                        <div
                          className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {category.name}
                        </div>
                        <div
                          className={`text-sm truncate max-w-xs transition-colors duration-300 ${
                            isDarkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                        category.parentCategory
                          ? isDarkMode
                            ? "bg-blue-900/30 text-blue-400 border border-blue-700"
                            : "bg-blue-100 text-blue-800"
                          : isDarkMode
                          ? "bg-purple-900/30 text-purple-400 border border-purple-700"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {category.parentCategory ? "Subcategory" : "Parent"}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {category.parentCategory?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {getStatusBadge(category)}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {category.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewCategory(category)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                        title="Edit Category"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete Category"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className={`px-6 py-4 text-center transition-colors duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div
            className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-800 border-gray-600 shadow-gray-900/50"
                : "bg-white border-gray-300 shadow-gray-200/50"
            }`}
          >
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-medium transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {modalType === "create" && "Create Category"}
                  {modalType === "edit" && "Edit Category"}
                  {modalType === "view" && "Category Details"}
                  {modalType === "delete" && "Delete Category"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  ×
                </button>
              </div>

              {modalType === "delete" ? (
                <div>
                  <p
                    className={`text-sm mb-4 transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Are you sure you want to delete "{selectedCategory?.name}"?
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                        isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : modalType === "view" ? (
                <div className="space-y-3">
                  <div>
                    <label
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Name
                    </label>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCategory?.name}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Description
                    </label>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCategory?.description}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Type
                    </label>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCategory?.parentCategory
                        ? "Subcategory"
                        : "Parent Category"}
                    </p>
                  </div>
                  {selectedCategory?.parentCategory && (
                    <div>
                      <label
                        className={`text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Parent Category
                      </label>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedCategory.parentCategory.name}
                      </p>
                    </div>
                  )}
                  <div>
                    <label
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Status
                    </label>
                    <div className="flex space-x-1 mt-1">
                      {getStatusBadge(selectedCategory)}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Description
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Parent Category
                      </label>
                      <select
                        value={formData.parentCategory}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parentCategory: e.target.value,
                          })
                        }
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      >
                        <option value="">None (Parent Category)</option>
                        {parentCategories.map((parent) => (
                          <option key={parent._id} value={parent._id}>
                            {parent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Color
                      </label>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        className={`mt-1 block w-full h-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sortOrder: parseInt(e.target.value),
                          })
                        }
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="isActive"
                          className={`ml-2 block text-sm transition-colors duration-300 ${
                            isDarkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          Active
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              featured: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="featured"
                          className={`ml-2 block text-sm transition-colors duration-300 ${
                            isDarkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          Featured
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                        isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 transition-all duration-200 hover:scale-105"
                    >
                      {modalType === "create" ? "Create" : "Update"} Category
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
