import DbInitializer from "../models/index.js";
import { ApiError, ResponseHandeler } from "../utils/Error.js";

const authenticateDbConnection = async (models) => {
  return models.sequelize
    .authenticate()
    .then(() => {
      return {
        status: 200,
      };
    })
    .catch((err) => {
      return {
        status: 503,
        body: err,
      };
    });
};

const performDbAction = async (actionMethod) => {
  const models = await DbInitializer();
  const authStatus = await authenticateDbConnection(models);
  const response =
    authStatus.status == 200
      ? await actionMethod(models)
      : ApiError(500, "Database Connection Error");
  if (response) response.isRaw = true;
  return response;
};

export { performDbAction };
