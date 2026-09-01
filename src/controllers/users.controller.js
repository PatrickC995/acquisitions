import logger from "#config/logger.js";
import { getAllUsers } from "#services/users.services.js";

export const fetchAllUsers = async (req, res) => {
    try {
        logger.info("Getting users...");

        const users = await getAllUsers();

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (e) {
        logger.error("Error fetching users", e);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};
