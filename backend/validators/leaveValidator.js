exports.validateLeaveRequest = (data) => {
  const errors = [];

  if (!data.employeeId || data.employeeId.trim().length === 0) {
    errors.push('Employee ID is required');
  }

  if (!data.leaveType || !['ANNUAL', 'SICK', 'EMERGENCY', 'CASUAL', 'MATERNITY', 'PATERNITY'].includes(data.leaveType)) {
    errors.push('Valid leave type is required');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (!data.endDate) {
    errors.push('End date is required');
  }

  if (!data.numberOfDays || data.numberOfDays < 1) {
    errors.push('Number of days must be at least 1');
  }

  if (!data.reason || data.reason.trim().length === 0) {
    errors.push('Reason is required');
  }

  // Validate date range
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (end < start) {
      errors.push('End date must be after start date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
