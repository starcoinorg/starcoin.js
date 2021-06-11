import { Logger } from "@ethersproject/logger";
import { version } from "../version";
const logger = new Logger(version);

export function checkProperties(object: any, properties: { [name: string]: boolean }): void {
    if (!object || typeof (object) !== "object") {
        logger.throwArgumentError("invalid object", "object", object);
    }

    Object.keys(object).forEach((key) => {
        if (!properties[key]) {
            logger.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
        }
    });
}