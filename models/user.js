export default (Sequelize, DataTypes) => {
    const User = Sequelize.define("users", {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        country_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mobile_number: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_mobile_verify: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }
    }, {
        timestamps: false,
    });

    User.associate = (models) => {
        // Will open when api logs will open
        // User.hasMany(models.user_api_logs, {
        //     foreignKey: "user_id",
        //     as: "api_logs",
        //     constraints: false,
        // });        
    };

    return User;
};
