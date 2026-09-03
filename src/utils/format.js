export const formatvalidationError = errors => {
  if (!errors || !Array.isArray(errors)) {
    return 'Validation failed';
  }

  return errors.map(i => i.message).join(', ');
};
