"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPProvider = void 0;
const client_js_1 = require("@open-rpc/client-js");
/**
 * @public
 *
 * HttpProvider should be used to send rpc calls over http
 */
class HTTPProvider {
    constructor(uri = 'http://127.0.0.1:9850', headers) {
        const transport = new client_js_1.HTTPTransport(uri, headers);
        this.client = new client_js_1.Client(new client_js_1.RequestManager([transport]));
    }
    close() {
        this.client.close();
    }
    async request(args) {
        return await this.client.request(args);
    }
}
exports.HTTPProvider = HTTPProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSFRUUFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9IVFRQUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbURBQTRFO0FBSTVFOzs7O0dBSUc7QUFDSCxNQUFhLFlBQVk7SUFHdkIsWUFBWSxHQUFHLEdBQUcsdUJBQXVCLEVBQUUsT0FBZ0M7UUFDekUsTUFBTSxTQUFTLEdBQUcsSUFBSSx5QkFBYSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksa0JBQU0sQ0FBQyxJQUFJLDBCQUFjLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQXFCO1FBQ2pDLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0NBQ0Y7QUFmRCxvQ0FlQyJ9