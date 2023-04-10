/**
  Validates a request by parsing its JSON body and checking for an Authorization header.
  @async
  @param {Request} req - The request to validate.
  @returns {Promise<{ authHeader: string; }>} - An object containing the Authorization header of the request.
  @throws {Error} - If the request is invalid (no Authorization header provided or unknown parameters in the JSON body) or if there is an error parsing the request body.
  */
export const validateRequest = async (req: Request): Promise<{ authHeader: string }> => {
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
      if (requestKeys.length > 0) {
        throw new Error(
          JSON.stringify({
            message: 'Invalid request',
            error: `Unknown parameters: ${requestKeys.toString()}`,
          }),
        );
      }

      return { authHeader };
    }

    return { authHeader };
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
