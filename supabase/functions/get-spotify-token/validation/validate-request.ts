import { z } from 'zod';

const schema = z.object({
  userId: z
    .string({
      required_error: 'Missing required property: userId',
      invalid_type_error: 'Expected property userId to be of type string',
    })
    .min(1, { message: 'Property userId cannot be an empty string' }),
  forceRefetch: z
    .boolean({
      invalid_type_error: 'Property forceRefetch must be of type boolean',
    })
    .optional(),
});

export const validateRequest = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    throw new Error('Invalid request: No authorization provided.');
  }

  const validationResponse = schema.safeParse(await request.json());

  if (!validationResponse.success) {
    throw new Error('Invalid request: ' + JSON.stringify(validationResponse.error));
  }

  return { authHeader, ...validationResponse.data };
};
