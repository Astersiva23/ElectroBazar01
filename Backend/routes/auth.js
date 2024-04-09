import express from 'express';
import { loginUser, logoutUser, registerUser,forgotPassword,resetPassword, getUserProfile, updatePassword, updateProfile, allUsers, getUserDetail, updateUser, deleteUser, uploadAvatar } from '../controllers/authControllers.js';
const router = express.Router();

import {authorizeRoles, isAuthentictedUser} from '../middlewares/authh.js'

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthentictedUser,getUserProfile); 
router.route("/me/update").put(isAuthentictedUser,updateProfile); 
router.route("/password/update").put(isAuthentictedUser,updatePassword); 
router.route("/me/upload_avatar").put(isAuthentictedUser,uploadAvatar); 


router.route("/admin/users").get(isAuthentictedUser,authorizeRoles("admin"),allUsers);
router.route("/admin/users/:id")
.get(isAuthentictedUser,authorizeRoles("admin"),getUserDetail)
.put(isAuthentictedUser,authorizeRoles("admin"),updateUser)
.delete(isAuthentictedUser,authorizeRoles("admin"),deleteUser);
export default router;

