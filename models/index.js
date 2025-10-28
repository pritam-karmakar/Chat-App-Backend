import Sequelize from "sequelize";
import dbConfig from "../config/config.js";
const env = process.env.NODE_ENV || "development";

// importing models
import User from "./user.js";
// import UserApiLogs from "./user_api_logs.js";

export default async () => {
    const db = {};
    const sequlizer = new Sequelize(
        dbConfig[env].database,
        dbConfig[env].username,
        dbConfig[env].password,
        {
            host: dbConfig[env].host,
            port: dbConfig[env].port,
            dialect: dbConfig[env].dialect,
            operatorsAliases: 0,
            logging: true,

            pool: {
                max: 15,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        }
    );

    registerAllModels(sequlizer, db, Sequelize.DataTypes);

    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
        if (db[modelName].addScopes) {
            db[modelName].addScopes(db);
        }
    });

    sequlizer.sync().then(() => {
        console.log(`Database synchronized successfully with ${env}😀🎃🤴🎉`);
    }).catch((error) => {
        console.error("Database Error ❌❌❌:-", error);
    });

    db.sequelize = sequlizer;
    db.Sequelize = Sequelize;
    return db;
};

// Database using with models
const registerAllModels = (sequlizer, db, dataTypes) => {
    db['users'] = User(sequlizer, dataTypes)
    // db['user_api_logs'] = UserApiLogs(sequlizer, dataTypes)

};
