import logger from "#config/logger.js"
import db from '#config/database.js'
import { users } from "#models/user.model.js";


export const getAllUsers = async () => {
    try{
        return await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.createdAt,
            updated_at: users.updatedAt
        }).from(users);

    } catch (e) {
    logger.error("Error getting users", e);
    throw e;
    }

}
