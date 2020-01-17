import { ObjectID } from "mongodb";

const Query =  {

    /*
    users: async (parent, args, ctx, info) => {
        const { db } = ctx;
        const { email, token } = args;
        const usersCollection = db.collection('authors');
        const user = await usersCollection.findOne({email});
        let users;
        if(user && user.token === token){
            users = await usersCollection.find({}).toArray();
        }else{
            throw new Error('You need a session!');
        }
        
        return users;
    },
    */

    posts: async (parent, args, ctx, info) => {
        const { db } = ctx;
        const { email, token } = args;
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('authors');
        const user = await usersCollection.findOne({email});
        let posts;
        if(user && user.token === token){
            posts = await postsCollection.find({}).toArray();
        }else{
            throw new Error('You need a session!');
        }
        return posts;
    },

    postsByAuthor: async (parent, args, ctx, info) => {
        const { db } = ctx;
        const { email, token, author } = args;
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('authors');
        const user = await usersCollection.findOne({email});
        let posts;
        if(user && user.token === token){
            posts = await postsCollection.find({author: ObjectID(author)}).toArray();
        }else{
            throw new Error('You need a session!');
        }
        return posts;
    },

    post: async (parent, args, ctx, info) => {
        const { db } = ctx;
        const { email, token } = args;
        const post_id = args.post;
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('authors');
        const user = await usersCollection.findOne({email});
        let post;
        if(user && user.token === token){
            post = await postsCollection.findOne({_id: ObjectID(post_id)});
        }else{
            throw new Error('You need a session!');
        }
        return post;
    },

};

export {Query as default}