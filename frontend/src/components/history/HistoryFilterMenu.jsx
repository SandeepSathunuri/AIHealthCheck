import React from 'react';
import {
  Box,
  Typography,
  Menu,
  FormControl,
  Select,
  MenuItem,
  Button,
  Divider,
} from '@mui/material';
import {
  FilterList,
  DateRange,
  PhotoCamera,
  VolumeDown,
} from '@mui/icons-material';

const HistoryFilterMenu = ({
  anchorEl,
  open,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  isDarkMode,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: isDarkMode ? "rgba(10, 10, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: isDarkMode 
            ? "1px solid rgba(255, 255, 255, 0.12)" 
            : "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: 2,
          minWidth: 300,
          transition: "none",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: isDarkMode ? "white" : "black",
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FilterList />
          Filter Records
        </Typography>

        <Divider
          sx={{ borderColor: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)", mb: 2 }}
        />

        {/* Date Range Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <DateRange fontSize="small" />
            Date Range
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.dateRange}
              onChange={(e) => onFilterChange("dateRange", e.target.value)}
              sx={{
                color: isDarkMode ? "white" : "black",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                },
                "& .MuiSelect-icon": {
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                },
                transition: "none",
              }}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Has Image Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PhotoCamera fontSize="small" />
            Has Image
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.hasImage}
              onChange={(e) => onFilterChange("hasImage", e.target.value)}
              sx={{
                color: isDarkMode ? "white" : "black",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                },
                "& .MuiSelect-icon": {
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                },
                transition: "none",
              }}
            >
              <MenuItem value="all">All Records</MenuItem>
              <MenuItem value="yes">With Image</MenuItem>
              <MenuItem value="no">Without Image</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Has Audio Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <VolumeDown fontSize="small" />
            Has Audio
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.hasAudio}
              onChange={(e) => onFilterChange("hasAudio", e.target.value)}
              sx={{
                color: isDarkMode ? "white" : "black",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                },
                "& .MuiSelect-icon": {
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                },
                transition: "none",
              }}
            >
              <MenuItem value="all">All Records</MenuItem>
              <MenuItem value="yes">With Audio</MenuItem>
              <MenuItem value="no">Without Audio</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ borderColor: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)", mb: 2 }} />

        {/* Filter Actions */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onClearFilters}
            sx={{
              color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
              "&:hover": {
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={onClose}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Menu>
  );
};

export default HistoryFilterMenu;