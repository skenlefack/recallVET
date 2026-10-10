export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} est requis`;
  }
  return null;
};

export const validateEmail = (value) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Adresse email invalide';
  }
  return null;
};

export const validatePhone = (value) => {
  if (value && !/^[\d\s\+\-\(\)]{6,20}$/.test(value)) {
    return 'Numero de telephone invalide';
  }
  return null;
};

export const validateMinLength = (value, min, fieldName) => {
  if (value && value.length < min) {
    return `${fieldName} doit contenir au moins ${min} caracteres`;
  }
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
};
