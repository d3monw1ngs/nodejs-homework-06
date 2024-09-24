import Joi from 'joi';

// Define validation for adding/updating a contact
const contactValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
});

// Define validation for updating favorite field
const favoriteValidation = Joi.object({
    favorite: Joi.boolean().required(),
});

// Define validation for signup
const signupValidation = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required()
        .messages({
            "any.required": "Missing required email field",
            "string.email": "Invalid email format",
        }),
    password: Joi.string().min(6).max(16).required().messages({
        "any.required": "Missing required password field",
        "string.min": "Password msut be at least {#limit} characters long",
        "string.max": "Password cannot be longer than {#limit} characters",
    }),
});

// Define validation for subscription
const subscriptionValidation = Joi.object({
    subscription: Joi.string().valid("starter", "pro", "business").required(),
});


export { contactValidation, favoriteValidation, signupValidation, subscriptionValidation };