import joi from "joi";

export const signUpValidationSchema = joi.object({
    country_code: joi.string().pattern(new RegExp('^[+][0-9]{1,3}$')).required(),
    mobile_number: joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
});

export const otpVeficationValidationSchema = joi.object({
    submitted_otp: joi.string().required(),
    token: joi.string().required()
})