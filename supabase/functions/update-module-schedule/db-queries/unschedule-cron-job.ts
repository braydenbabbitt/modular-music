import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

export const unscheduleCronJob = async (dbPool: postgres.Pool, jobName: string) => {
  try {
    const connection = await dbPool.connect();

    try {
      const queryString = `
        select cron.unschedule('${jobName}');
      `;

      await connection.queryObject(queryString);
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};
