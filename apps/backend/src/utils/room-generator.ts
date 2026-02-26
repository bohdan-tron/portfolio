import { uuidv7 } from "uuidv7";

export function generateRoomCode(): string {
  const characters = "0123456789abcdef";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export function generateUuid(): string {
  return uuidv7();
}
