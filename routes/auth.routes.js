import express from "express";
import {
    userSignUp,
    userOtpVefication
} from "../controllers/auth/auth.controller.js";


const Router = express.Router();

// User Sign Up Route
Router.post('/sign-up', userSignUp);
Router.post('/verify-otp', userOtpVefication);

export default Router;