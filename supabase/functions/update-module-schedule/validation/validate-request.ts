import { z } from 'zod';

const schema = z.object({
  scheduleId: z
    .string({
      required_error: 'Missing required property: scheduleId',
      invalid_type_error: 'Expected property scheduleId to be of type string',
    })
    .min(1, { message: 'Property scheduleId cannot be an empty string' }),
  isNew: z.boolean({
    required_error: 'Missing required property: isNew',
    invalid_type_error: 'Expected property isNew to be of type boolean',
  }),
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
