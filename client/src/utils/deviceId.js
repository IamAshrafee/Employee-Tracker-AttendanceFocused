import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "device_id";

/**
 * Get or generate device ID
 */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

/**
 * Get device fingerprint info
 */
export const getDeviceFingerprint = () => {
  return {
    deviceId: getDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

/**
 * Format device info as string
 */
export const formatDeviceInfo = () => {
  const fingerprint = getDeviceFingerprint();
  return `${fingerprint.platform} - ${fingerprint.userAgent.substring(0, 50)}`;
};
