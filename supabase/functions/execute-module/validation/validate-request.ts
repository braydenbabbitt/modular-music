import { z } from 'zod';

const schema = z.object({
  moduleId: z
    .string({
      required_error: 'Missing required property: moduleId',
      invalid_type_error: 'Expected property moduleId to be of type string',
    })
    .min(1, { message: 'Property moduleId cannot be an empty string' }),
  scheduleId: z
    .string({
      invalid_type_error: 'Expected property scheduleId to be of type string',
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
