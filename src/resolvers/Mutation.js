import { ObjectID, PubSub } from "mongodb";
import * as uuid from 'uuid';

const Mutation =  {
    sign_up: async(parent, args, ctx, info) => {
        const { db } = ctx;
        const authorsCollection = db.collection('authors');
        const { email, password, is_author } = args;
        if(await authorsCollection.findOne({email})){
            throw new Error(`${email} already exists!`);
        }
        const result = await authorsCollection.insertOne({
            email,
            password,
            author: is_author,
        });
        return result.ops[0];
    },

    sign_in: async(parent, args, ctx, info) => {
        const { db } = ctx;
        const authorsCollection = db.collection('authors');
        const { email, password } = args;
        const token = uuid.v4();
        const author = await authorsCollection.findOne({email});
        if(author && author.password === password){
            await authorsCollection.updateOne({ _id: ObjectID(author._id) }, { $set: { token } });
            setTimeout( async () => {
                // 30 min * 60 seg/min * 1000 ms/s = 1800000 ms de timeout
                await authorsCollection.updateOne({ _id: ObjectID(author._id) }, { $set: { token: undefined } });
            }, 1800000);
        }else{
            throw new Error('Username or password are incorrect!');
        }
        return token;
    },

    sign_out: async(parent, args, ctx, info) => {
        const { db } = ctx;
        const { email, token } = args;
        const authorsCollection = db.collection('authors');
        const author = await authorsCollection.findOne({email});
        if(author && author.token === token){
            await authorsCollection.updateOne({ email }, { $set: { token: undefined } });
        }else{
            throw new Error('Username or password are incorrect!');
        }
        return token;
    },

    delete_user: async(parent, args, ctx, info) => {
        const { db } = ctx;
        const { email, token } = args;
        const usersCollection = db.collection('authors');
        const user = await usersCollection.findOne({email});
        if(user && user.token === token){
            await usersCollection.deleteOne({ email, token });
            if(user.author){
                const postsCollection = db.collection('posts');
                await postsCollection.deleteMany({author: ObjectID(user._id)});
            }
        }else{
            throw new Error('Username or password are incorrect!');
        }
        return user;
    },

    publish: async(parent, args, ctx, info) => {
        const { db, pubsub } = ctx;
        const postsCollection = db.collection('posts');
        const {title, description, email, token } = args;
        const usersCollection = db.collection('authors');
        const user = await usersCollection.findOne({email});
        let post;
        if(user && user.token === token){
            if(user.author){ // Check if it is an author
                post = await postsCollection.insertOne({
                    title,
                    description,
                    author: ObjectID(user._id),
                });
                pubsub.publish(
                    user._id,
                    {
                        authorSubscription: post.ops[0]
                    }
                );
            }else{
                throw new Error('You are not an author!');
            }
        }else{
            throw new Error('Your session has timed out, log in again!');
        }
        return post.ops[0];
    },

    remove_post: async (parent, args, ctx, info) => {
        const { db } = ctx;
        const {email , token } = args;
        const post_id = args.post;
        const usersCollection = db.collection('authors');
        const user = await usersCollection.findOne({email});
        let post;
        if(user && user.token === token){
            console.log('hola')
            const postsCollection = db.collection('posts');
            post = await postsCollection.findOne({_id: ObjectID(post_id)});
            console.log(post);
            if((post.author).toString() === (user._id).toString()){ // Check if post was created by user
                await postsCollection.deleteOne({_id: ObjectID(post_id)});
            }else{
                throw new Error('You do not have permissions!');
            }
        }else{
            throw new Error('Your session has timed out, log in again!');
        }
        return post;
    },

};

export {Mutation as default}