/**
 * Debug utility functions
 */

/**
 * Logs API request data to console only in development mode
 * @param data Data to log
 * @param label Optional label for the log
 */
export const logApiRequest = <T>(data: T, label = "API Request"): T => {
  console.log(`====== ${label} ======`);
  console.log(JSON.stringify(data, null, 2));
  console.log("=====================");

  return data;
};
