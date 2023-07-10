export type TsPrimitiveName =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function';

export type TsPrimitive = string | number | bigint | boolean | symbol | undefined | Record<string, unknown>;
