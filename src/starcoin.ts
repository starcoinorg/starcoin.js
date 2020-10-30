import { Method } from './Method';
import { outputMoveValuesFormatter } from './utils/formatters';

export const dev_callContract = new Method({
  callName: 'dev.call_contract',
  params: 1,
  outputFormatter: outputMoveValuesFormatter
});

