import { ok } from '../utils/http.js';
import { getAiStatus } from '../services/ai/index.js';

export const health = () => ok({ status: 'ok', ai: getAiStatus() });
