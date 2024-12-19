import {HttpException} from "@nestjs/common";

export class ValidationUtil {
    /**
     * Parses and
     *
     * @param {string} personId The persons Id as a string.
     * @returns {number} The parsed number.
     * @throws {HttpException} If the provided ID is not a valid number > 0.
     * @private
     */
    public static parseID(personId: string): number {
        const parsedId = parseInt(personId);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new HttpException(`No valid ID provided. ID: ${personId}`, 422);
        }
        return parsedId;
    }
}
