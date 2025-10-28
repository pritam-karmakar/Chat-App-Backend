import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { performDbAction } from "../../db/dbHelper.js";
import { ApiError, ResponseHandeler } from "../../utils/Error.js";
import {
    signUpValidationSchema,
    otpVeficationValidationSchema,
} from "../../validation/schema/auth/auth.js";
import { JoiValidation } from "../../validation/ValidationFN.js";
import { Op } from "sequelize";
import { jwtGenerate, jwtVerify } from "../../utils/JwtToken.js";
import buildJwtPayload from "../../utils/JwtPayload.js";

// Register New User
export const userSignUp = async (req, res) => {
    const { success, errors, value } = await JoiValidation(
        signUpValidationSchema,
        req.body,
        { isAbortEarly: false }
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }
    
    try {

        const isUserExist = await models.users.findOne({
            where: {
                mobile_number: value.mobile_number,
            },
        });

        if (isUserExist) {
            return ResponseHandeler(res, {
                status: 400,
                message: "User already exists! Please Sign in.",
            });
        }

        const newTransaction = await models.sequelize.transaction();
        const OTP = '000000';

        const user = await models.users.create({
            ...value,
            otp: OTP,
            created_by: 1
        }, { transaction: newTransaction });

        await newTransaction.commit();
        const Token = await jwtGenerate({
            ...value,
            'otp' : OTP
        });

        return ResponseHandeler(res, {
            status: 201,
            message: "User Registered Successfully",
            data: { Token }
        });
    } catch (error) {
        console.log(error, "error with server");
        await newTransaction.rollback();
        return ResponseHandeler(res, {
            status: 500,
            message: "Internal Server Error",
        });
    }
};

// Verify New User
export const userOtpVefication = async (req, res) => {
    const { success, errors, value } = await JoiValidation(
        otpVeficationValidationSchema,
        req.body,
        { isAbortEarly: false }
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }
    
    try {

        const isUserExist = await models.users.findOne({
            where: {
                [Op.or]: {
                    mobile_number: value.mobile_number,
                },
            },
        });

        if (isUserExist) {
            return ResponseHandeler(res, {
                status: 400,
                message: "User Already Exist",
            });
        }

        const newTransaction = await models.sequelize.transaction();

        const user = await models.users.create({
            ...value,
            otp: '000000',
            created_by: 1
        }, { transaction: newTransaction }
        );

        await newTransaction.commit();

        return ResponseHandeler(res, {
            status: 201,
            message: "User Registered Successfully",
        });
    } catch (error) {
        console.log(error, "error with server");
        await newTransaction.rollback();
        return ResponseHandeler(res, {
            status: 500,
            message: "Internal Server Error",
        });
    }
}

// Login User
export const login = async (req, res, next, { enforcer, models }) => {
    const { success, errors, value } = await JoiValidation(
        userLoginSchema,
        req.body,
        {
            isAbortEarly: false,
        }
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }

    const { email, password } = value;

    try {
        const userData = await models.user.findAll({
            where: {
                email,
            },
            include: [
                {
                    model: models.organizations,
                    as: "organizations",
                },
                {
                    model: models.role,
                    as: "roles",
                },
            ],
        });

        if (userData.length === 0 || !userData[0]) {
            return ResponseHandeler(res, {
                status: 400,
                message: "User Not Found or Invalid Email",
            });
        }

        const passwordValue = userData[0].dataValues.password;
        const isPasswordMatched = await bcrypt.compare(password, passwordValue); // Password checking

        if (!isPasswordMatched) {
            return ResponseHandeler(res, {
                status: 400,
                message: "Invalid Password",
            });
        }

        const jwtPayload = {
            id: userData[0].dataValues.id,
            role_id: userData[0].dataValues.roles[0].roleId,
            role_name: userData[0].dataValues.roles[0].roleName,
            email: userData[0].dataValues.email,
            is_active: userData[0].dataValues.is_active,
            org_type: userData[0].dataValues.organization_type,
            picture_url: userData[0].dataValues.picture_url,
        };

        if (userData[0].dataValues.organization_type === "business") {
            jwtPayload.org_id = userData[0].dataValues.organizations[0].id;
        }
        const token = await jwtGenerate(jwtPayload);

        return ResponseHandeler(res, {
            message: "User logged in successfully",
            data: {
                ...jwtPayload,
                token,
            },
        });
    } catch (error) {
        console.log(error, "error");
        return ResponseHandeler(res, {
            status: 500,
        });
    }
};

export const loginWithGoogleUserCheck = async (
    req,
    res,
    next,
    { enforcer, models }
) => {
    const { success, errors, value } = await JoiValidation(
        googleToken,
        req.query,
        { isAbortEarly: false }
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }

    const { token } = value;

    try {
        // 1) Fetch Google profile
        const googleRes = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!googleRes.data) {
            return ResponseHandeler(res, {
                status: 400,
                message: "Invalid Google Token",
            });
        }

        const email = googleRes.data.email;
        const userData = await models.user.findOne({
            where: {
                email,
            },
        });

        return ResponseHandeler(res, {
            message: "User logged in successfully",
            data: {
                isNewUser: !userData ? true : false,
                ...googleRes.data,
            },
        });
    } catch (error) {
        console.log(error, "error");
        return ResponseHandeler(res, {
            status: 500,
            message: "Internal Server Error",
        });
    }
};

export const googleAuth = async (req, res, next, { enforcer, models }) => {
    const { success, errors, value } = await JoiValidation(
        googleAuthSchema,
        req.body,
        { isAbortEarly: false }
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }

    const {
        email,
        name,
        picture,
        organization_type,
        mobile_number,
        role_id,
        organization_name,
        email_verified,
        googleId,
    } = value;

    const transaction = await models.sequelize.transaction();
    try {
        let user = await models.user.findOne({
            where: { email },
            include: [
                { model: models.organizations, as: "organizations" },
                { model: models.role, as: "roles" },
            ],
            transaction,
        });

        // create new user flow
        let otpToken = null;
        if (!user) {
            const userPayload = {
                username: name,
                email,
                is_email_verify: email_verified,
                mobile_number,
                google_id: googleId,
                picture_url: picture,
                provider: "google",
                created_by: 0,
                organization_type,
            };

            user = await models.user.create(userPayload, { transaction });

            await models.user_roles.create(
                { user_id: user.id, role_id },
                { transaction }
            );

            if (organization_type === "business") {
                const org = await models.organizations.create(
                    { name: organization_name },
                    { transaction }
                );
                await models.user_organizations.create(
                    { user_id: user.id, organization_id: org.id },
                    { transaction }
                );
            }

            const { data } = await sendEmailOTP({
                email,
                subject: "OxLand Team",
                userName: name,
                templeteFn: emailTemplateHTML(name),
            });
            otpToken = data;

            await user.reload({
                include: [
                    { model: models.role, as: "roles" },
                    { model: models.organizations, as: "organizations" },
                ],
                transaction,
            });

            // build payload for response
            const plain = user.get({ plain: true });
            const jwtPayload = buildJwtPayload(plain);

            // token generation
            const token = await jwtGenerate(jwtPayload);

            await transaction.commit();

            return ResponseHandeler(res, {
                status: 200,
                message: "User Registered Successfully",
                data: { ...jwtPayload, otpToken, token },
            });
        }

        // existing user flow (no OTP by default)
        const plainExisting = user.get ? user.get({ plain: true }) : user;

        const jwtPayload = buildJwtPayload(plainExisting);

        // token generation
        const token = await jwtGenerate(jwtPayload);

        await transaction.commit();
        return ResponseHandeler(res, {
            status: 200,
            message: "User logged in successfully",
            data: { ...jwtPayload, token },
        });
    } catch (err) {
        console.error(err);
        try {
            await transaction.rollback();
        } catch (rbErr) {
            console.error("Rollback failed:", rbErr);
        }
        return ResponseHandeler(res, {
            status: 500,
            message: "Internal Server Error",
        });
    }
};

// Reset Password
export const resetPasswordSend = async (req, res) => {
    const { success, errors, value } = await JoiValidation(
        resetPasswordSendSchema,
        req.body
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }

    const { email } = value;

    return performDbAction(async (models) => {
        try {
            const userData = await models.user.findOne({
                where: {
                    email,
                },
            });

            if (!userData) {
                return ResponseHandeler(res, {
                    status: 400,
                    message: "User Not Registered or Invalid Email",
                });
            }

            const { otpToken } = await sendEmailOTP({
                email,
                subject: "OxLand Reset Password",
                userName: userData.username,
            });

            return ResponseHandeler(res, {
                status: 200,
                message: "Email Sent Successfully",
                data: {
                    otpToken,
                },
            });
        } catch (error) {
            console.log(error, "Server Error");
            return ResponseHandeler(res, {
                status: 500,
            });
        }
    });
};

export const verifyResetPassword = async (req, res) => {
    const { success, errors, value } = await JoiValidation(
        verifyEmailRule,
        req.body,
        { isAbortEarly: false }
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }

    const { token, otp: submittedOTP } = value;

    try {
        const emailVerify = await jwtVerify(token);

        return performDbAction(async (models) => {
            const findUser = await models.user.findOne({
                where: {
                    email: emailVerify.email,
                },
            });

            if (!findUser) {
                return ResponseHandeler(res, {
                    status: 400,
                    message: "User Not Found Or Invalid Email",
                });
            }

            const isOTPvalid = await bcrypt.compare(submittedOTP, emailVerify.otp);

            if (!isOTPvalid) {
                return ResponseHandeler(res, {
                    status: 400,
                    message: "Invalid OTP",
                });
            }

            return ResponseHandeler(res, {
                status: 200,
                message: "OTP verified successfully",
            });
        });
    } catch (error) {
        console.log(error);
        return ResponseHandeler(res, {
            status: error.name === "TokenExpiredError" ? 406 : 500,
            message:
                error.name === "TokenExpiredError"
                    ? "OTP has been expired"
                    : "Something went wrong with verify email",
        });
    }
};

export const verifyandAndUpdateResetPassword = async (req, res) => {
    const { success, errors, value } = await JoiValidation(
        updatePasswordSchema,
        req.body
    );

    if (!success && errors) {
        return ResponseHandeler(res, {
            status: 400,
            message: "Validation Error",
            data: errors,
        });
    }

    const { token, newPassword } = value;

    try {
        const user = await jwtVerify(token);
        return performDbAction(async (models) => {
            const isUserExist = await models.user.findOne({
                where: {
                    email: user.email,
                },
            });

            if (!isUserExist) {
                return ResponseHandeler(res, {
                    status: 400,
                    message: "User Not Found",
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await models.user.update(
                { password: hashedPassword, updated_at: new Date() },
                { where: { email: user.email } }
            );
            return ResponseHandeler(res, {
                message: "Password Reset Successfully",
            });
        });
    } catch (error) {
        console.log(error);
        return ResponseHandeler(res, {
            status: error.name === "TokenExpiredError" ? 406 : 500,
            message:
                error.name === "TokenExpiredError"
                    ? "OTP has been expired"
                    : "Something went wrong with verify email",
        });
    }
};
// ........Reset Password..........
