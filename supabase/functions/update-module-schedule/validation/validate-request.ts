import { TsPrimitiveName } from '../types/generics.ts';

type ValidationObject = {
  key: string;
  types: TsPrimitiveName[];
};

const requestBodyValidation: ValidationObject[] = [
  { key: 'scheduleId', types: ['string'] },
  { key: 'isNew', types: ['boolean'] },
];

type UpdateModuleScheduleRequestBodyType = {
  scheduleId: string;
  isNew: boolean;
};

type UpdateModuleScheduleRequestValidatedType = UpdateModuleScheduleRequestBodyType & { authHeader: string };

export const validateRequest = async (req: Request): Promise<UpdateModuleScheduleRequestValidatedType> => {
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

    if (typeof parsedRequest !== 'object') {
      const errorMessage = `Expected body to be an object, but found ${typeof parsedRequest}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const requestKeys = Object.keys(parsedRequest);
    requestKeys.forEach((key) => {
      const validationObj = requestBodyValidation.find((item) => item.key === key);
      if (!validationObj) {
        const errorMessage = `Expected to find parameter ${key} in request body, but found none`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      if (!validationObj.types.includes(typeof parsedRequest[key])) {
        const errorMessage = `Expected parameter ${key} to be of type ${validationObj.types.join(
          ' | ',
        )}, but found ${typeof parsedRequest[key]}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      return false;
    });

    const validatedRequestBody = {
      scheduleId: parsedRequest.scheduleId,
      isNew: parsedRequest.isNew,
    } satisfies UpdateModuleScheduleRequestBodyType;

    return { authHeader, ...validatedRequestBody };
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
