import { config } from "dotenv";
config();

const ENV = process.env.NODE_ENV;

export class ApiError extends Error {
  constructor(statusCode = 500, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ResponseHandeler = (
  res,
  { status = 200, message = "Internal Server Error", data = [], error = null }
) => {
  const Results = {
    success: status < 400 ? true : false,
    message,
  };

  if ((status <= 400 && data) || status === 404 || status === 403 ) {
    Results.data = data;
  }
  if (error && status >= 400) {
    Results.error = error;
  }

  res.status(status).json(Results);
};
