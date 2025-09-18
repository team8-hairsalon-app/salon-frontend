export function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email).trim());
}

export function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d|[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return Math.min(score, 4);
}

export function validateDOB(isoDate) {
  if (!isoDate) return false;
  const dob = new Date(isoDate);
  if (isNaN(dob)) return false;
  const now = new Date();
  const thirteenAgo = new Date(
    now.getFullYear() - 13,
    now.getMonth(),
    now.getDate()
  );
  return dob <= thirteenAgo;
}