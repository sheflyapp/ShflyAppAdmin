import React, { useState, useEffect } from "react";
import callAPI from "../services/callAPI";
import { useTheme } from "../contexts/ThemeContext";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const Users = () => {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    username: "",
    email: "",
    userType: "seeker",
    country: "",
    gender: "other",
    dob: "1990-01-01",
    specialization: "",
    price: 0,
    isVerified: false,
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== "all" && { userType: filterType }),
      });

      const response = await callAPI.get(`/api/admin/users?${params}`);

      if (response.data.success) {
        // Ensure users array exists and is valid
        const usersData = response.data.data?.users || [];
        const paginationData = response.data.data?.pagination || {};
        
        setUsers(Array.isArray(usersData) ? usersData : []);
        setTotalPages(paginationData.totalPages || 1);
        setTotalUsers(paginationData.totalUsers || 0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Ensure user object exists and has required properties
    if (!user || typeof user !== "object") return false;

    // Safe search with null checks
    const fullname = (user.fullname || "").toString();
    const email = (user.email || "").toString();
    const username = (user.username || "").toString();

    const matchesSearch =
      fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || user.userType === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "verified" && user.isVerified) ||
      (filterStatus === "unverified" && !user.isVerified) ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleToggleActive = async (userId) => {
    try {
      const user = users.find((u) => u._id === userId);
      const response = await callAPI.put(`/api/admin/users/${userId}/status`, {
        isActive: !user.isActive,
      });

      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, isActive: !user.isActive } : user
          )
        );
        toast.success(
          `User ${!user.isActive ? "activated" : "deactivated"} successfully`
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        const response = await callAPI.delete(`/api/admin/users/${userId}`);

        if (response.data.success) {
          setUsers(users.filter((user) => user._id !== userId));
          toast.success("User deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      const response = await callAPI.put(
        `/api/admin/users/${userData._id}`,
        userData
      );

      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user._id === userData._id ? response.data.data : user
          )
        );
        setShowEditModal(false);
        setEditingUser(null);
        toast.success("User updated successfully");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleAddUser = () => {
    setNewUser({
      fullname: "",
      username: "",
      email: "",
      userType: "seeker",
      country: "",
      gender: "other",
      dob: "1990-01-01",
      specialization: "",
      price: 0,
      isVerified: false,
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await callAPI.post("/api/admin/users", userData);

      if (response.data.success) {
        setUsers([response.data.data, ...users]);
        setShowAddModal(false);
        toast.success("User created successfully");
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
            isDarkMode
              ? "bg-red-900/30 text-red-200"
              : "bg-red-100 text-red-800"
          }`}
        >
          Inactive
        </span>
      );
    }
    if (!user.isVerified) {
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
            isDarkMode
              ? "bg-yellow-900/30 text-yellow-200"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          Unverified
        </span>
      );
    }
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
          isDarkMode
            ? "bg-green-900/30 text-green-200"
            : "bg-green-100 text-green-800"
        }`}
      >
        Active
      </span>
    );
  };

  const getUserTypeBadge = (userType) => {
    // Safety check for undefined or null userType
    if (!userType || typeof userType !== "string") {
      userType = "unknown";
    }

    const colors = isDarkMode
      ? {
          seeker: "bg-blue-900/30 text-blue-200",
          provider: "bg-purple-900/30 text-purple-200",
          admin: "bg-gray-700 text-gray-200",
          unknown: "bg-gray-600 text-gray-200",
        }
      : {
          seeker: "bg-blue-100 text-blue-800",
          provider: "bg-purple-100 text-purple-800",
          admin: "bg-gray-100 text-gray-800",
          unknown: "bg-gray-200 text-gray-600",
        };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
          colors[userType] || colors.unknown
        }`}
      >
        {userType.charAt(0).toUpperCase() + userType.slice(1)}
      </span>
    );
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
        <div className="flex justify-between items-center">
          <div>
            <h1
              className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Users Management
            </h1>
            <p
              className={`transition-colors duration-300 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Manage all users in the system
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 transition-all duration-200 hover:scale-105"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
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
              <UserIcon
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
                Total Users
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {users.length}
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
              <CheckCircleIcon
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
                Verified Users
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {users.filter((u) => u.isVerified).length}
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
              <UserIcon
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
                Providers
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {users.filter((u) => u.userType === "provider").length}
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
                isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
              }`}
            >
              <UserIcon
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
                Seekers
              </p>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {users.filter((u) => u.userType === "seeker").length}
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
                  placeholder="Search users..."
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

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="all">All Types</option>
                <option value="seeker">Seekers</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table
            className={`min-w-full divide-y transition-colors duration-300 ${
              isDarkMode ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            <thead
              className={`transition-colors duration-300 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  User
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  Type
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  Country
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  Joined
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? "text-gray-200" : "text-gray-500"
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
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className={`transition-colors duration-300 ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      >
                        <UserIcon
                          className={`h-6 w-6 transition-colors duration-300 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="ml-4">
                        <div
                          className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {user.fullname}
                        </div>
                        <div
                          className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {user.email}
                        </div>
                        <div
                          className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? "text-gray-400" : "text-gray-400"
                          }`}
                        >
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUserTypeBadge(user.userType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {user.country}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                        title="Edit User"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(user._id)}
                        className={`transition-colors duration-200 ${
                          user.isActive
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                        title={
                          user.isActive ? "Deactivate User" : "Activate User"
                        }
                      >
                        {user.isActive ? (
                          <XCircleIcon className="h-5 w-5" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Delete User"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div
            className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md transition-colors duration-300 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-medium transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  User Details
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Full Name
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedUser.fullname}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Username
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    @{selectedUser.username}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedUser.email}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    User Type
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedUser.userType}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Gender
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedUser.gender}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Country
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedUser.country}
                  </p>
                </div>

                {selectedUser.specialization && (
                  <div>
                    <label
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Specialization
                    </label>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedUser.specialization}
                    </p>
                  </div>
                )}

                {selectedUser.price && (
                  <div>
                    <label
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Price
                    </label>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ${selectedUser.price}/hour
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
                  <div className="flex space-x-2 mt-1">
                    {getStatusBadge(selectedUser)}
                    {getUserTypeBadge(selectedUser.userType)}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Joined
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Last Login
                  </label>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {new Date(selectedUser.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateUser(editingUser);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editingUser.fullname}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          fullname: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          username: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User Type
                    </label>
                    <select
                      value={editingUser.userType}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          userType: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="seeker">Seeker</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editingUser.country}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          country: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={editingUser.isVerified}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          isVerified: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isVerified"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Verified User
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingUser.isActive}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Active User
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New User
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateUser(newUser);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.fullname}
                      onChange={(e) =>
                        setNewUser({ ...newUser, fullname: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User Type *
                    </label>
                    <select
                      required
                      value={newUser.userType}
                      onChange={(e) =>
                        setNewUser({ ...newUser, userType: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="seeker">Seeker</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Provider-specific fields */}
                  {newUser.userType === "provider" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Specialization *
                        </label>
                        <input
                          type="text"
                          required
                          value={newUser.specialization || ""}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              specialization: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Mental Health, Life Coaching"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price per Hour
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newUser.price || 0}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      value={newUser.country}
                      onChange={(e) =>
                        setNewUser({ ...newUser, country: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      value={newUser.gender}
                      onChange={(e) =>
                        setNewUser({ ...newUser, gender: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={newUser.dob}
                      onChange={(e) =>
                        setNewUser({ ...newUser, dob: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={newUser.isVerified}
                      onChange={(e) =>
                        setNewUser({ ...newUser, isVerified: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isVerified"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Verified User
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newUser.isActive}
                      onChange={(e) =>
                        setNewUser({ ...newUser, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Active User
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`px-4 py-3 flex items-center justify-between border-t sm:px-6 transition-colors duration-300 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalUsers)}
                </span>{" "}
                of <span className="font-medium">{totalUsers}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-300 ${
                      currentPage === i + 1
                        ? isDarkMode
                          ? "z-10 bg-custom-btnBg/30 border-custom-btnBg text-custom-btnBg"
                          : "z-10 bg-custom-btnBg/10 border-custom-btnBg text-custom-btnBg"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
