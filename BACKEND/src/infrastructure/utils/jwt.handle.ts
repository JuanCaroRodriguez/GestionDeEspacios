import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret.11";

const generateToken = (payload: any) => {
  return sign(payload, JWT_SECRET, {
    expiresIn: "3h",
  });
};

const verifyToken = (token: string) => {
  return verify(token, JWT_SECRET);
};

export { generateToken, verifyToken };