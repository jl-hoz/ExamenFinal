import { ObjectID } from "mongodb";

const Subscription = {

    authorSubscription: {
        subscribe: async (parent, args, ctx, info) => {
            const { email, token } = args;
            const author_id = args.author;
            const { db, pubsub } = ctx;
            const usersCollection = db.collection('authors');
            const user = await usersCollection.findOne({ email });
            if (user && user.token === token) {
                const author = await usersCollection.findOne({_id: ObjectID(author_id)});
                if(!author){
                    throw new Error('Author does not exists!');
                }
            } else {
                throw new Error('Username or password are incorrect!');
            }
            return pubsub.asyncIterator(author_id); // Listen to changes in id, if so then broadcast to all subscriptors
        }
    },

};

export { Subscription as default }