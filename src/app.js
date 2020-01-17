import { GraphQLServer, PubSub } from 'graphql-yoga';
import { MongoClient, ObjectID } from "mongodb";
import "babel-polyfill";

import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import User from './resolvers/User';
import Post from './resolvers/Post';
import Subscription from './resolvers/Subscription';

const usr = "jl";
const pwd = "admin123";
const url = "cluster0-bwtd1.gcp.mongodb.net/test";

/**
 * Connects to MongoDB Server and returns connected client
 * @param {string} usr MongoDB Server user
 * @param {string} pwd MongoDB Server pwd
 * @param {string} url MongoDB Server url
 */
const connectToDb = async function (usr, pwd, url) {
    const uri = `mongodb+srv://${usr}:${pwd}@${url}`;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    await client.connect();
    return client;
};

const runGraphQLServer = function (context) {
    const resolvers = {
        User,
        Post,
        Query,
        Mutation,
        Subscription,
    };
    const server = new GraphQLServer({ typeDefs: './src/schema.graphql', resolvers, context });
    const options = {
        port: 8000
    };
    try {
        server.start(options, ({ port }) => console.log(`Server started, listening on port ${port} for incoming requests.`));
    } catch (e) {
        console.info(e);
        server.close();
    }
};

const runApp = async function () {
    const client = await connectToDb(usr, pwd, url);
    console.log("Connect to Mongo DB");
    try {
        const db = client.db('Blog');
        const pubsub = new PubSub();
        runGraphQLServer({ client, db, pubsub });
    } catch (e) {
        console.log(e);
        client.close();
    }
};

runApp();