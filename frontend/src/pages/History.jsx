import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Alert,
  Pagination,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme, lightTheme } from "../styles/theme";
import ModernSidebar from "../components/ui/ModernSidebar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import HistoryHeader from "../components/history/HistoryHeader";
import HistorySearchBar from "../components/history/HistorySearchBar";
import HistoryTable from "../components/history/HistoryTable";
import HistoryFilterMenu from "../components/history/HistoryFilterMenu";
import ImagePreviewDialog from "../components/history/ImagePreviewDialog";
import EmptyHistoryState from "../components/history/EmptyHistoryState";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { API_ENDPOINTS, getHistoryItemUrl } from "../config/api";

// All components are now imported from separate files

const History = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState({
    open: false,
    url: "",
    title: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: "all",
    hasImage: "all",
    hasAudio: "all",
  });
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isSmallScreen = useMediaQuery(darkTheme.breakpoints.down("md"));

  const recordsPerPage = 10;

  const getFilteredRecords = () => {
    let filtered = history;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((record) => {
        switch (searchField) {
          case "transcription":
            return (
              record.transcription &&
              record.transcription.toLowerCase().includes(query)
            );
          case "response":
            return (
              record.doctorResponse &&
              record.doctorResponse.toLowerCase().includes(query)
            );
          case "date":
            const date = new Date(record.createdAt)
              .toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              .toLowerCase();
            return date.includes(query);
          case "all":
          default:
            return (
              (record.transcription &&
                record.transcription.toLowerCase().includes(query)) ||
              (record.doctorResponse &&
                record.doctorResponse.toLowerCase().includes(query)) ||
              new Date(record.createdAt)
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                .toLowerCase()
                .includes(query)
            );
        }
      });
    }

    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.createdAt);

        switch (filters.dateRange) {
          case "today":
            return recordDate >= today;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return recordDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return recordDate >= monthAgo;
          case "year":
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return recordDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    if (filters.hasImage !== "all") {
      filtered = filtered.filter((record) => {
        const hasImage = Boolean(record.imagePath);
        return filters.hasImage === "yes" ? hasImage : !hasImage;
      });
    }

    if (filters.hasAudio !== "all") {
      filtered = filtered.filter((record) => {
        const hasAudio = Boolean(record.audioOutputPath);
        return filters.hasAudio === "yes" ? hasAudio : !hasAudio;
      });
    }

    return filtered;
  };

  const filteredRecords = getFilteredRecords();
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleTheme = () => {
    toggleDarkMode();
  };

  const handleViewImage = (imageUrl, title) => {
    setImagePreview({ open: true, url: imageUrl, title });
  };

  const handleCloseImagePreview = () => {
    setImagePreview({ open: false, url: "", title: "" });
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchFieldChange = (event) => {
    setSearchField(event.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: "all",
      hasImage: "all",
      hasAudio: "all",
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange !== "all") count++;
    if (filters.hasImage !== "all") count++;
    if (filters.hasAudio !== "all") count++;
    return count;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        const res = await fetch(API_ENDPOINTS.HISTORY, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          setHistory(data.history || []);
        } else {
          setError(data.message || "Failed to fetch history");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(
          "Unable to connect to the server. Please ensure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getHistoryItemUrl(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setSuccess("Record deleted successfully");
        setHistory(history.filter((record) => record.id !== id));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || "Failed to delete record");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      setError("Error deleting record. Please try again.");
    }
  };

  const handleEdit = (record) => {
    navigate("/home", { state: { editRecord: record } });
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: isDarkMode
            ? "linear-gradient(135deg, #0a0a1e 0%, #1a1a3a 50%, #2d1b69 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          position: "relative",
          overflow: "hidden",
          transition: "none", // Disable background transitions
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%)",
            zIndex: 0,
            transition: "none",
          }}
        />

        <ModernSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          user={user}
        />

        <HistoryHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          recordCount={history.length}
          isDarkMode={isDarkMode}
        />

        <Container
          maxWidth="xl"
          sx={{ py: 4, position: "relative", zIndex: 1 }}
        >
          {history.length > 0 && (
            <HistorySearchBar
              searchQuery={searchQuery}
              searchField={searchField}
              filteredRecords={filteredRecords}
              isDarkMode={isDarkMode}
              onSearchChange={handleSearchChange}
              onSearchFieldChange={handleSearchFieldChange}
              onClearSearch={handleClearSearch}
              onFilterClick={handleFilterClick}
              getActiveFilterCount={getActiveFilterCount}
            />
          )}

          <HistoryFilterMenu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isDarkMode={isDarkMode}
          />

          {error && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Box>
          )}

          {success && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <LoadingSpinner message="Loading medical history..." />
            </Box>
          ) : history.length === 0 ? (
            <EmptyHistoryState isDarkMode={isDarkMode} />
          ) : (
            <>
              <HistoryTable
                records={currentRecords}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewImage={handleViewImage}
                isDarkMode={isDarkMode}
              />

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "white",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                        "&.Mui-selected": {
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                        },
                        transition: "none", // Disable pagination transitions
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}

          <ImagePreviewDialog
            open={imagePreview.open}
            onClose={handleCloseImagePreview}
            imageUrl={imagePreview.url}
            title={imagePreview.title}
            isDarkMode={isDarkMode}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default History;
