import { TsPrimitiveName } from '../types/generics.ts';

type ValidationObject = {
  key: string;
  types: TsPrimitiveName[];
};

const REQUEST_BODY_VALIDATION: ValidationObject[] = [{ key: 'userId', types: ['string'] }];

type ValidatedRequestBody = {
  userId: string;
};

type ValidatedRequest = ValidatedRequestBody & {
  authHeader: string;
};

export const validateRequest = async (req: Request): Promise<ValidatedRequest> => {
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
      const validationObj = REQUEST_BODY_VALIDATION.find((item) => item.key === key);
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

    const validatedRequestBody: ValidatedRequestBody = {
      userId: parsedRequest.userId,
    };

    return { ...validatedRequestBody, authHeader };
  } catch (err) {
    console.error(err);
    throw new Error(
      JSON.stringify({
        message: 'Error parsing request body',
        requestBody: req.body,
        error: err,
      }),
    );
  }
};
