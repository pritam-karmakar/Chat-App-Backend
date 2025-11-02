import { config } from "dotenv";
config();
import jwt from "jsonwebtoken";

/**
 * @param {object} payload
 * @param {object} options
 * @returns {Promise<String>} -token
 */

export function jwtGenerate(
  payload,
  {
    secret = process.env.JWT_SECRET,
    expiresIn = process.env.JWT_EXPIRES_IN,
  } = {}
) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, { expiresIn }, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

/**
 * @param {string} token
 * @param {string} secret
 * @returns {Promise<object>} - decoded
 */

export function jwtVerify(token, { secret = process.env.JWT_SECRET } = {}) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return reject({
            name: "TokenExpiredError",
            message: "Token has expired",
            expiredAt: err.expiredAt,
          });
        }
        return reject(err);
      }
      resolve(decoded);
    });
  });
}
