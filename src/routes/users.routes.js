import express from 'express';
import { fetchAllUsers, fetchUserById, updateUserById, deleteUserById } from '#controllers/users.controller.js';
import { authenticate } from '#middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all user routes
router.use(authenticate);

router.get('/', fetchAllUsers);
router.get('/get/:id', fetchUserById);
router.put('/update/:id', updateUserById);
router.delete('/delete/:id', deleteUserById);

export default router;