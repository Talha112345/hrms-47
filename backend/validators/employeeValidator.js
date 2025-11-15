exports.validateEmployee = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  }

  if (!data.department || data.department.trim().length === 0) {
    errors.push('Department is required');
  }

  if (!data.position || data.position.trim().length === 0) {
    errors.push('Position is required');
  }

  if (!data.joinDate) {
    errors.push('Join date is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

function isValidEmail(email) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}
