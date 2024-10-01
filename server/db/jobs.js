import { connection } from './connection.js';
import { generateId } from './ids.js';

const getJobTable = () => connection.table('job');

export async function getJobs() {
  return await getJobTable().select();
}

export async function getJob(id) {
  return await getJobTable().first().where({ id });
}
export async function getJobsByCompany(companyId) {
  return await getJobTable().select().where({ companyId });
}
// Helper function to add retry logic
const withRetry = async (operation, maxRetries = 5, delay = 200) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error.message.includes('database is locked') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};

export async function createJob({ companyId, title, description }) {
  const job = {
    id: generateId(),
    companyId,
    title,
    description,
    createdAt: new Date().toISOString(),
  };

  await withRetry(async () => {
    const queryBuilder = connection.isTransaction
        ? connection
        : await connection.transaction();

    try {
      await queryBuilder('job').insert(job);
      if (!connection.isTransaction) {
        await queryBuilder.commit();
      }
    } catch (error) {
      if (!connection.isTransaction) {
        await queryBuilder.rollback();
      }
      throw error;
    }
  });

  return job;
}
export async function deleteJob(id) {
  const job = await getJobTable().first().where({ id });
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  await getJobTable().delete().where({ id });
  return job;
}

export async function updateJob({ id, title, description }) {
  const job = await getJobTable().first().where({ id });
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  const updatedFields = { title, description };
  await getJobTable().update(updatedFields).where({ id });
  return { ...job, ...updatedFields };
}
