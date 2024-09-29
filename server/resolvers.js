import {getJob, getJobs, getJobsByCompany} from "./db/jobs.js";
import {getCompany} from "./db/companies.js";

export const resolvers = {
    Query: {
        job: (_root, {id}) => getJob(id),
        company: (_root, {id}) => getCompany(id),
        jobs: () => getJobs()
    },
    Job: {
        company: (job) => getCompany(job.companyId),
        date: (job) => toIsoDate(job.createdAt)
    },
    Company: {
        jobs : (company) => getJobsByCompany(company.id)
    }
};

function toIsoDate(value){
    return value.slice(0, 'yyyy-mm-dd'.length)
}