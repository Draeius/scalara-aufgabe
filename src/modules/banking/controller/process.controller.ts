import {Controller, Param, Post} from "@nestjs/common";
import {ProcessService} from "../services/process.service";

@Controller("process")
export class ProcessController {

    public constructor(private processService: ProcessService) {
    }

    /**
     * Endpoint to start a process based on the given process ID.
     *
     * This method validates the provided process ID and executes the corresponding processes
     * by delegating to the `validateAndExecuteProcess` method of the process service.
     *
     * @param {string} processId - The process ID received from the URL parameter. Must be a valid string
     * representation of a positive integer.
     * @returns {Promise<{response: string}>} - A promise that resolves to a success message indicating the executed
     * processes.
     * @throws {HttpException} - Throws an exception if the process ID is invalid (handled by the service).
     */
    @Post(":processId")
    public async startProcess(@Param("processId") processId: string): Promise<{ response: string }> {
        return {response: await this.processService.validateAndExecuteProcess(processId)};
    }
}