/**
 * Validates a request and returns the authorization header and schedule ID.
 * @param req - The request object to validate.
 * @returns A promise that resolves to an object containing the authorization header and schedule ID.
 * @throws If the request is invalid or an error occurs during validation.
 */
export const validateRequest = async (req: Request): Promise<{ authHeader: string; scheduleId: string }> => {
  try {
    const parsedRequest = await req.json();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error(
        JSON.stringify({
          message: 'Invalid request',
          error: 'No authorization provided',
        }),
      );
    }

    if (typeof parsedRequest === 'object') {
      const requestKeys = Object.keys(parsedRequest);
      throw new Error(
        JSON.stringify({
          message: 'Invalid request',
          error: `Unknown parameters: ${requestKeys.toString()}`,
        }),
      );
    }

    if (typeof parsedRequest !== 'string') {
      throw new Error(
        JSON.stringify({
          message: 'Invalid request',
          error: 'Expected request body to be a string',
        }),
      );
    }

    return { authHeader, scheduleId: parsedRequest };
  } catch (error) {
    throw new Error(
      JSON.stringify({
        message: 'Error parsing request body.',
        requestBody: req.body,
        error,
      }),
    );
  }
};
