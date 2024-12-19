import {HttpException} from "@nestjs/common";

export class ValidationUtil {
    /**
     * Parses and validates the provided ID.
     *
     * @param {string} id The ID as a string.
     * @returns {number} The parsed number.
     * @throws {HttpException} If the provided ID is not a valid number > 0.
     * @private
     */
    public static parseID(id: string): number {
        const parsedId = parseInt(id);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new HttpException(`No valid ID provided. ID: ${id}`, 422);
        }
        return parsedId;
    }
}
