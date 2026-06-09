export function generateStrongPassword(length: number = 8): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "@#$%&";

  const allChars = uppercase + lowercase + digits + special;

  // Ensure at least one char from each set
  const getRandom = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

  let password = [
    getRandom(uppercase),
    getRandom(lowercase),
    getRandom(digits),
    getRandom(special),
  ];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password.push(getRandom(allChars));
  }

  // Shuffle to avoid predictable order
  password = password.sort(() => Math.random() - 0.5);

  return password.join("");
}
