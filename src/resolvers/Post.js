import { ObjectID } from "mongodb";

const Post =  {
    author: async (parent, args, ctx, info) => {
        // Connect to database
        const { db } = ctx;
        const usersCollection = db.collection('authors');
        const author_id = parent.author;
        const author = await usersCollection.findOne({ _id: ObjectID(author_id)});
        return author;
    }

};

export {Post as default}