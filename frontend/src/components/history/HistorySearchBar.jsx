import React from 'react';
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
} from '@mui/icons-material';
import GlassCard from '../ui/GlassCard';

const HistorySearchBar = ({
  searchQuery,
  searchField,
  filteredRecords,
  isDarkMode,
  onSearchChange,
  onSearchFieldChange,
  onClearSearch,
  onFilterClick,
  getActiveFilterCount,
}) => {
  return (
    <GlassCard
      sx={{
        mb: 3,
        transition: "none",
        transform: "none",
        "&:hover": {
          transform: "none",
          boxShadow: "none",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              placeholder="Search medical records..."
              value={searchQuery}
              onChange={onSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={onClearSearch}
                      edge="end"
                      size="small"
                      sx={{
                        color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                        transition: "none",
                      }}
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  color: isDarkMode ? "white" : "black",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00d4ff",
                  },
                  transition: "none",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel
                id="search-field-label"
                sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
              >
                Search In
              </InputLabel>
              <Select
                labelId="search-field-label"
                value={searchField}
                onChange={onSearchFieldChange}
                label="Search In"
                sx={{
                  color: isDarkMode ? "white" : "black",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00d4ff",
                  },
                  "& .MuiSelect-icon": {
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                  },
                  transition: "none",
                }}
              >
                <MenuItem value="all">All Fields</MenuItem>
                <MenuItem value="transcription">Voice Input</MenuItem>
                <MenuItem value="response">AI Analysis</MenuItem>
                <MenuItem value="date">Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={onFilterClick}
              sx={{
                color: isDarkMode ? "white" : "black",
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                height: "56px",
                position: "relative",
                "&:hover": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                  backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              Filters
              {getActiveFilterCount() > 0 && (
                <Chip
                  label={getActiveFilterCount()}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "#fa709a",
                    color: "white",
                    fontSize: "0.75rem",
                    height: 20,
                    minWidth: 20,
                  }}
                />
              )}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
              <Typography
                variant="body2"
                sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
              >
                {filteredRecords.length}{" "}
                {filteredRecords.length === 1 ? "record" : "records"}{" "}
                found
                {searchQuery && ` for "${searchQuery}"`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </GlassCard>
  );
};

export default HistorySearchBar;