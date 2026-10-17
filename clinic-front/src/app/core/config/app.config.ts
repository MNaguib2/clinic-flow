
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');

export const SESSION_STORAGE_KEY = 'clinicflow-auth';
export const REFRESH_EARLY_MS = 5 * 60 * 1000; // 5 minutes

// Browser setTimeout delays are signed 32-bit milliseconds; larger values may overflow, so scheduleRefresh reschedules long waits in chunks.
export const MAX_TIMEOUT_MS = 2_147_483_647;
