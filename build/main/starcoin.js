"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chain = exports.dev = void 0;
const Method_1 = require("./Method");
const formatters_1 = require("./utils/formatters");
exports.dev = {
    call_contract: new Method_1.Method({
        callName: 'dev.call_contract',
        params: 1,
        outputFormatter: formatters_1.outputMoveValuesFormatter,
    }),
};
exports.chain = {
    head: new Method_1.Method({
        callName: 'chain.head',
        params: 0,
    }),
    get_block_by_hash: new Method_1.Method({
        callName: 'chain.get_block_by_hash',
        params: 1,
    }),
    get_block_by_number: new Method_1.Method({
        callName: 'chain.get_block_by_number',
        params: 1,
    }),
    get_blocks_by_number: new Method_1.Method({
        callName: 'chain.get_blocks_by_number',
        params: 2,
    }),
    get_block_by_uncle: new Method_1.Method({
        callName: 'chain.get_block_by_uncle',
        params: 1,
    }),
    get_transaction: new Method_1.Method({
        callName: 'chain.get_transaction',
        params: 1,
    }),
    branches: new Method_1.Method({
        callName: 'chain.branches',
        params: 0,
    }),
    current_epoch: new Method_1.Method({
        callName: 'chain.epoch',
        params: 0,
    }),
    get_epoch_info_by_number: new Method_1.Method({
        callName: 'chain.get_epoch_info_by_number',
        params: 1,
    }),
    get_global_time_by_number: new Method_1.Method({
        callName: 'chain.get_global_time_by_number',
        params: 1,
    }),
    get_events: new Method_1.Method({
        callName: 'chain.get_events',
        params: 1,
    }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcmNvaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RhcmNvaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQWtDO0FBZWxDLG1EQUErRDtBQUVsRCxRQUFBLEdBQUcsR0FBRztJQUNqQixhQUFhLEVBQUUsSUFBSSxlQUFNLENBQThCO1FBQ3JELFFBQVEsRUFBRSxtQkFBbUI7UUFDN0IsTUFBTSxFQUFFLENBQUM7UUFDVCxlQUFlLEVBQUUsc0NBQXlCO0tBQzNDLENBQUM7Q0FDSCxDQUFDO0FBRVcsUUFBQSxLQUFLLEdBQUc7SUFDbkIsSUFBSSxFQUFFLElBQUksZUFBTSxDQUFnQjtRQUM5QixRQUFRLEVBQUUsWUFBWTtRQUN0QixNQUFNLEVBQUUsQ0FBQztLQUNWLENBQUM7SUFDRixpQkFBaUIsRUFBRSxJQUFJLGVBQU0sQ0FBcUI7UUFDaEQsUUFBUSxFQUFFLHlCQUF5QjtRQUNuQyxNQUFNLEVBQUUsQ0FBQztLQUNWLENBQUM7SUFDRixtQkFBbUIsRUFBRSxJQUFJLGVBQU0sQ0FBdUI7UUFDcEQsUUFBUSxFQUFFLDJCQUEyQjtRQUNyQyxNQUFNLEVBQUUsQ0FBQztLQUNWLENBQUM7SUFDRixvQkFBb0IsRUFBRSxJQUFJLGVBQU0sQ0FBcUM7UUFDbkUsUUFBUSxFQUFFLDRCQUE0QjtRQUN0QyxNQUFNLEVBQUUsQ0FBQztLQUNWLENBQUM7SUFDRixrQkFBa0IsRUFBRSxJQUFJLGVBQU0sQ0FBNEI7UUFDeEQsUUFBUSxFQUFFLDBCQUEwQjtRQUNwQyxNQUFNLEVBQUUsQ0FBQztLQUNWLENBQUM7SUFDRixlQUFlLEVBQUUsSUFBSSxlQUFNLENBQTJCO1FBQ3BELFFBQVEsRUFBRSx1QkFBdUI7UUFDakMsTUFBTSxFQUFFLENBQUM7S0FDVixDQUFDO0lBQ0YsUUFBUSxFQUFFLElBQUksZUFBTSxDQUFrQjtRQUNwQyxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLE1BQU0sRUFBRSxDQUFDO0tBQ1YsQ0FBQztJQUNGLGFBQWEsRUFBRSxJQUFJLGVBQU0sQ0FBZ0I7UUFDdkMsUUFBUSxFQUFFLGFBQWE7UUFDdkIsTUFBTSxFQUFFLENBQUM7S0FDVixDQUFDO0lBQ0Ysd0JBQXdCLEVBQUUsSUFBSSxlQUFNLENBQTJCO1FBQzdELFFBQVEsRUFBRSxnQ0FBZ0M7UUFDMUMsTUFBTSxFQUFFLENBQUM7S0FDVixDQUFDO0lBQ0YseUJBQXlCLEVBQUUsSUFBSSxlQUFNLENBQW1DO1FBQ3RFLFFBQVEsRUFBRSxpQ0FBaUM7UUFDM0MsTUFBTSxFQUFFLENBQUM7S0FDVixDQUFDO0lBRUYsVUFBVSxFQUFFLElBQUksZUFBTSxDQUF5QjtRQUM3QyxRQUFRLEVBQUUsa0JBQWtCO1FBQzVCLE1BQU0sRUFBRSxDQUFDO0tBQ1YsQ0FBQztDQUNILENBQUMifQ==