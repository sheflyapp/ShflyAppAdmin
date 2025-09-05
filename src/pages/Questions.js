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
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const Questions = () => {
  const { isDarkMode } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Fetch questions
  const fetchQuestions = async (page = 1, search = "", status = "all", priority = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status !== "all" && { status }),
        ...(priority !== "all" && { priority }),
      });

      const response = await callAPI(`/api/admin/questions?${params}`, "GET");
      
      if (response.success) {
        setQuestions(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalQuestions(response.pagination?.totalQuestions || 0);
      } else {
        toast.error("Failed to fetch questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage, searchTerm, filterStatus, filterPriority);
  }, [currentPage, searchTerm, filterStatus, filterPriority]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Handle priority filter
  const handlePriorityFilter = (priority) => {
    setFilterPriority(priority);
    setCurrentPage(1);
  };

  // View question details
  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };

  // Close question
  const handleCloseQuestion = async (questionId) => {
    try {
      const response = await callAPI(`/api/admin/questions/${questionId}/close`, "PATCH");
      
      if (response.success) {
        toast.success("Question closed successfully");
        fetchQuestions(currentPage, searchTerm, filterStatus, filterPriority);
      } else {
        toast.error("Failed to close question");
      }
    } catch (error) {
      console.error("Error closing question:", error);
      toast.error("Error closing question");
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await callAPI(`/api/admin/questions/${questionId}`, "DELETE");
      
      if (response.success) {
        toast.success("Question deleted successfully");
        fetchQuestions(currentPage, searchTerm, filterStatus, filterPriority);
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Error deleting question");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "answered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Questions Management
              </h1>
              <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Manage all user questions and answers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Total: {totalQuestions} questions
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => handlePriorityFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => fetchQuestions(currentPage, searchTerm, filterStatus, filterPriority)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Questions Table */}
        <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                No questions found
              </h3>
              <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                No questions match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Question
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      User
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Category
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Priority
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Created
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"}`}>
                  {questions.map((question) => (
                    <tr key={question._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {truncateText(question.description, 80)}
                            </div>
                            {question.tags && question.tags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {question.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  >
                                    <TagIcon className="h-3 w-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {question.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{question.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className={`text-sm font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {question.userId?.fullname || "Unknown User"}
                            </div>
                            <div className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {question.userId?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}>
                            {question.category?.name || "N/A"}
                          </div>
                          <div className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            {question.subcategory?.name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                          {question.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(question.priority)}`}>
                          {question.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-900"
                        }`}>
                          {formatDate(question.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewQuestion(question)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? "text-blue-400 hover:bg-blue-900"
                                : "text-blue-600 hover:bg-blue-100"
                            }`}
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {question.status !== "closed" && (
                            <button
                              onClick={() => handleCloseQuestion(question._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? "text-green-400 hover:bg-green-900"
                                  : "text-green-600 hover:bg-green-100"
                              }`}
                              title="Close Question"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuestion(question._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? "text-red-400 hover:bg-red-900"
                                : "text-red-600 hover:bg-red-100"
                            }`}
                            title="Delete Question"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-700"}`}>
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600"
                    : isDarkMode
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600"
                    : isDarkMode
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Question Details Modal */}
        {showQuestionModal && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Question Details
                  </h3>
                  <button
                    onClick={() => setShowQuestionModal(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:bg-gray-700"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Question Content */}
                  <div>
                    <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Question
                    </h4>
                    <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"} whitespace-pre-wrap`}>
                      {selectedQuestion.description}
                    </p>
                  </div>

                  {/* User Information */}
                  <div>
                    <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      User Information
                    </h4>
                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Name:
                          </span>
                          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedQuestion.userId?.fullname || "Unknown User"}
                          </p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Email:
                          </span>
                          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedQuestion.userId?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Information */}
                  <div>
                    <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Category Information
                    </h4>
                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Category:
                          </span>
                          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedQuestion.category?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Subcategory:
                          </span>
                          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedQuestion.subcategory?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Metadata */}
                  <div>
                    <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Question Details
                    </h4>
                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Status:
                          </span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQuestion.status)}`}>
                              {selectedQuestion.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Priority:
                          </span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedQuestion.priority)}`}>
                              {selectedQuestion.priority}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Created:
                          </span>
                          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {formatDate(selectedQuestion.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            <TagIcon className="h-4 w-4 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedQuestion.attachments && selectedQuestion.attachments.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Attachments
                      </h4>
                      <div className="space-y-2">
                        {selectedQuestion.attachments.map((attachment, index) => (
                          <div key={index} className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"}`}
                            >
                              {attachment.description || `Attachment ${index + 1}`}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  {selectedQuestion.status !== "closed" && (
                    <button
                      onClick={() => {
                        handleCloseQuestion(selectedQuestion._id);
                        setShowQuestionModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Close Question
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteQuestion(selectedQuestion._id);
                      setShowQuestionModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Question
                  </button>
                  <button
                    onClick={() => setShowQuestionModal(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
