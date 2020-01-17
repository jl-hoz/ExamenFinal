import { ObjectID } from "mongodb";

const User =  {
    posts: async (parent, args, ctx, info) => {
        // Connect to database
        const { db } = ctx;
        const postsCollection = db.collection('posts');
        const author_id = parent._id;
        const posts = await postsCollection.find({ author: ObjectID(author_id)}).toArray();
        return posts;
    }

};

export {User as default}