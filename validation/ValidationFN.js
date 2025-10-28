import Joi from "joi";

/**
 * 
 * @param {Joi.Schema} schema 
 * @param {any} body 
 * @param {boolean} [options.isAbortEarly=true] - If true, abort the validation when the first error is found.
 * @returns {Promise<{success: boolean, value: any}> | {success: boolean, errors: { key: any; message: any; path: any; }} }
 */

// Note: When use this JoiValidation function, it will return a Promise object. So you can use await to get the result.

export const JoiValidation = async (
    schema,
    body,
    { isAbortEarly = true, ...options } = {},
) => {
    const { error, value } = schema.validate(body, { abortEarly: isAbortEarly, ...options, allowUnknown: true });

    if (error) {
        const errors = error.details.map((err) => ({
            key: err.context.key,
            message: err.message,
            path: err.path[0],
        }));
        return { success: false, errors };
    }

    return { success: true, value };
};
