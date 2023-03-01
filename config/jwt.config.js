import jwt from "jsonwebtoken";

export function generateToken(user) {
  const { _id, nome, email, role } = user;

  const signature = process.env.TOKEN_SIGN_SECRET;

  const expiration = "8h";

  return jwt.sign({ _id, nome, email, role }, signature, {
    expiresIn: expiration,
  });
}
