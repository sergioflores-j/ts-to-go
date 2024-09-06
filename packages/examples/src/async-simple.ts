// TODO: fix lint
// eslint-disable-next-line import/no-extraneous-dependencies
import wrapException from '@ts-to-go/wrap-exception';

class ValidationError extends Error {}
class ConnectionError extends Error {}
class DBQueryError extends Error {}

type DBConnection = {
  id: string;
  databaseUrl: string;
  status: 'active' | 'inactive';
};

type DBResult<T = unknown> = {
  limit: number;
  results: Array<T>;
};

type User = {
  name: string;
  age: number;
};

type HandlerReturnType = {
  statusCode: number;
  body: string;
};

const validateDBUrl = (databaseUrl: string) => {
  if (!databaseUrl) throw new ValidationError('databaseUrl is required');
  if (databaseUrl.startsWith('mysql://'))
    throw new ValidationError('databaseUrl is invalid');
};

const connectToDB = async (databaseUrl: string): Promise<DBConnection> => {
  validateDBUrl(databaseUrl);

  // Some request
  const connection: DBConnection = await Promise.resolve({
    databaseUrl,
    id: 'connection-id',
    status: 'active',
  });

  if (connection.status === 'inactive')
    throw new ConnectionError('connection inactive');

  return connection;
};

const dbQuery = <T>(connection: DBConnection): Promise<DBResult<T>> => {
  if (connection.status !== 'active')
    throw new ConnectionError('connection is not active');

  // @ts-expect-error: mocked values for simplicity sake
  return Promise.resolve({
    limit: 50,
    results: [
      {
        name: 'Joost',
        age: 21,
      },
      {
        name: 'Kapsalon',
        age: 23,
      },
    ],
  });
};

const fetchUsers = wrapException(
  async (connection: DBConnection): Promise<DBResult<User>> => {
    const result: DBResult<User> = await dbQuery(connection);

    if (!result.results)
      throw new DBQueryError('query did not return the expected values');

    return result;
  },
);
/**
 * Complete order processor (receives orderId)
 *
 * fetch order
 * generate payment link
 * send email
 * update order status
 */

// TODO: write a better example with fetch instead
// Mixed example usage of wrapException
const handler = async (): Promise<HandlerReturnType> => {
  const connectToDBWrapped = wrapException(connectToDB);

  const dbConnectionResult = await connectToDBWrapped('some-db-name');

  if (dbConnectionResult.isError) {
    if (dbConnectionResult.error instanceof ValidationError) {
      console.warn('dbConnection bad request', dbConnectionResult.error);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Connection is invalid' }),
      };
    }

    console.error('dbConnection', dbConnectionResult.error);

    if (dbConnectionResult.error instanceof ConnectionError) {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Connection is inactive' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }

  console.info('dbConnectionInfo', dbConnectionResult.data);

  const usersResult = await fetchUsers(dbConnectionResult.data);

  if (usersResult.isError) {
    console.error('fetch users error', usersResult.error);

    if (usersResult.error instanceof ConnectionError) {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Connection is inactive' }),
      };
    }

    if (usersResult.error instanceof DBQueryError) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Users not found' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }

  console.log('users', usersResult.data);

  const responseBody: User[] = usersResult.data.results;

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
};

export default handler;
