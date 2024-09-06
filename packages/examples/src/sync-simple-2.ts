/* eslint-disable no-console */
import fs from 'node:fs';

// TODO: fix lint
// eslint-disable-next-line import/no-extraneous-dependencies
import wrapException from '@ts-to-go/wrap-exception';

type JsonFile = Record<PropertyKey, unknown>;

export const getJsonFile = wrapException(
  (filepath: string): JsonFile | undefined => {
    if (!filepath) throw new Error('filepath is required');

    const fileData = fs.readFileSync(filepath);

    if (!fileData) {
      return undefined;
    }

    return JSON.parse(fileData.toString('utf-8')) as JsonFile;
  },
);

type HandlerEvent = {
  body: {
    filepath: string;
  };
};

const handler = (event: HandlerEvent): JsonFile => {
  const { isError, error, data } = getJsonFile(event.body.filepath);

  if (isError) {
    if (error instanceof SyntaxError) {
      console.error('malformed json file', error);
      return {
        statusCode: 422,
        body: JSON.stringify({ message: 'malformed json file' }),
      };
    }

    if (error instanceof Error) {
      console.warn('user input error', error);
      return {
        statusCode: 400,
        body: JSON.stringify({}),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }

  if (!data) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Not found' }),
    };
  }

  console.log('successfully got the file', data);

  return {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };
};

export default handler;
