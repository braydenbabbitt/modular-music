const VALID_REQUEST_KEYS = ['id', 'moduleId', 'module_id'];

export const validateRequest = async (req: Request): Promise<{ moduleId: string; authHeader: string }> => {
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
      const invalidKeys = requestKeys.filter((key) => !VALID_REQUEST_KEYS.includes(key));
      if (invalidKeys.length > 0) {
        throw new Error(
          JSON.stringify({
            message: 'Invalid request',
            error: `Unknown parameters: ${invalidKeys.toString()}`,
          }),
        );
      }

      return { moduleId: parsedRequest[requestKeys[0]], authHeader };
    }

    return { moduleId: parsedRequest, authHeader };
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
