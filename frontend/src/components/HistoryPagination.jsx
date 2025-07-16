import React from 'react';
import { Stack, Button, IconButton, useTheme, Typography, Tooltip } from '@mui/material';
import { FirstPage, LastPage, NavigateBefore, NavigateNext, MoreHoriz } from '@mui/icons-material';

const HistoryPagination = ({ currentPage, totalPages, onPageChange, isDarkMode }) => {
  const theme = useTheme();

  const renderPageButtons = () => {
    const pages = [];

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    pages.push(
      <PageButton
        key={1}
        page={1}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isDarkMode={isDarkMode}
      />
    );

    if (start > 2) {
      pages.push(<Ellipsis key="start-ellipsis" />);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <PageButton
          key={i}
          page={i}
          currentPage={currentPage}
          onPageChange={onPageChange}
          isDarkMode={isDarkMode}
        />
      );
    }

    if (end < totalPages - 1) {
      pages.push(<Ellipsis key="end-ellipsis" />);
    }

    if (totalPages > 1) {
      pages.push(
        <PageButton
          key={totalPages}
          page={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
          isDarkMode={isDarkMode}
        />
      );
    }

    return pages;
  };

  return (
    <Stack spacing={1.5} direction="row" justifyContent="center" alignItems="center" mt={4}>
      <Tooltip title="First">
        <span>
          <IconButton
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            sx={iconButtonStyle(isDarkMode)}
          >
            <FirstPage />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Previous">
        <span>
          <IconButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={iconButtonStyle(isDarkMode)}
          >
            <NavigateBefore />
          </IconButton>
        </span>
      </Tooltip>

      {renderPageButtons()}

      <Tooltip title="Next">
        <span>
          <IconButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={iconButtonStyle(isDarkMode)}
          >
            <NavigateNext />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Last">
        <span>
          <IconButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            sx={iconButtonStyle(isDarkMode)}
          >
            <LastPage />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};

const PageButton = ({ page, currentPage, onPageChange, isDarkMode }) => {
  const isActive = currentPage === page;
  return (
    <Button
      variant={isActive ? 'contained' : 'outlined'}
      onClick={() => onPageChange(page)}
      sx={{
        minWidth: 36,
        height: 36,
        padding: 0,
        fontWeight: 500,
        backgroundColor: isActive
          ? isDarkMode
            ? '#00d4ff'
            : '#2563eb'
          : 'transparent',
        color: isActive
          ? '#ffffff'
          : isDarkMode
          ? '#d1d5db'
          : '#1e3a8a',
        borderColor: isDarkMode ? '#374151' : '#cbd5e1',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        },
      }}
    >
      {page}
    </Button>
  );
};

const Ellipsis = () => (
  <Typography variant="body2" sx={{ px: 1, color: 'gray' }}>
    <MoreHoriz fontSize="small" />
  </Typography>
);

const iconButtonStyle = (isDarkMode) => ({
  color: isDarkMode ? '#d1d5db' : '#1e3a8a',
  '&:hover': {
    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
  },
});

export default HistoryPagination;
