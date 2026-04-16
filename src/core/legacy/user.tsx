import {
  runQuery,
  createQuery,
  createReport,
  UserRepository,
} from '@amityco/ts-sdk-react-native';

export async function reportUser(userId: string): Promise<boolean> {
  return await new Promise((resolve, reject) => {
    const query = createQuery(createReport, 'user', userId);

    runQuery(query, (options) => {
      if (options.loading === false) {
        if (options.data !== undefined) {
          return resolve(options.data);
        } else {
          return reject(new Error('Unable to report user ' + options.error));
        }
      }
    });
  });
}

export async function getAmityUser(userId: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    const unsubscribe = UserRepository.getUser(userId, (userObject) => {
      if (userObject) {
        resolve({ userObject, unsubscribe });
      } else {
        reject((userObject as Record<string, any>).error);
      }
    });
  });
}
