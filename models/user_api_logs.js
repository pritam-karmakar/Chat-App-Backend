export default (sequelize, DataTypes) => {
    const UserApiLog = sequelize.define("user_api_logs", {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, {
        timestamps: false,
    });

    UserApiLog.associate = (models) => {
        UserApiLog.belongsTo(models.users, {
            foreignKey: "user_id",
            as: "user_api_logs"
        });
    }

    return UserApiLog;
}
