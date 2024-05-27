export const validateEmail = (email: string) => {
  const emailRegex = /.+@.+\..+/;
  return emailRegex.test(email);
};

export const validateMessage = (str: string) => {
  const regex = /\w+/g;
  return regex.test(str);
};
