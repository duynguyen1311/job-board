import {createJob, getJob, getJobs, getJobsByCompany} from "./db/jobs.js";
import {getCompany} from "./db/companies.js";
import {GraphQLError} from "graphql/error/index.js";

export const resolvers = {
    Query: {
        job: async (_root, {id}) => {
            const job = await getJob(id)
            if(!job) {
                throw new GraphQLError('No job found with id '+ id, {
                    extensions: {code: 'NOT_FOUND'},
                });
            }
            return job;
        },
        company: async (_root, {id}) => {
            const company = await getCompany(id)
            if(!company){
                throw new GraphQLError('No company found with id ' + id,{
                    extensions: {code: 'NOT_FOUND'},
                });
            }
            return company;
        },
        jobs: () => getJobs()
    },
    Job: {
        company: (job) => getCompany(job.companyId),
        date: (job) => toIsoDate(job.createdAt)
    },
    Mutation: {
        createJob: (_root, {input: {title, description}}) => {
            const companyId = 'FjcJCHJALA4i'; // TODO: set based on user
            return createJob({companyId, title, description})
        }
    },
    Company: {
        jobs : (company) => getJobsByCompany(company.id)
    }
};

function toIsoDate(value){
    return value.slice(0, 'yyyy-mm-dd'.length)
}