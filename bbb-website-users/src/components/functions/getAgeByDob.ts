export function getAgeByDob(dob: string): number {
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) {
    throw new Error("Invalid date of birth format");
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
}
