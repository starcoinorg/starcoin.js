import './index';
import { bcsDecode } from '../encoding';
import * as onchain_events_types from '../lib/runtime/onchain_events';
import { decodeEventKey as decode_event_key } from '../encoding';

export function decodeEventData(eventName: string, eventData: string): any {
  const eventType = onchain_events_types[eventName];
  const d = bcsDecode(
    eventType,
    eventData
  );
  return d;
}

export function decodeEventKey(eventKey: string): any {
  return decode_event_key(eventKey);
}