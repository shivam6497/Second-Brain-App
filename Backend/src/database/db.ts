import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true}
})

const tagSchema = new Schema({
    title: { type: String, required: true, unique: true}
});

const contentTypes = ['image', 'video', 'article', 'audio'];

const contentSchema = new Schema({
    link: { type: String, required: true},
    type: { type: String, enum: contentTypes, required: true},
    title: { type: String, required: true},
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag'}],
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        validate: async function(value: mongoose.Types.ObjectId) {
            const user = await mongoose.model('User').findById(value);
            if(!user) {
                throw new Error('User not found');
            }
        }
    }
});

const linkSchema = new Schema({
    hash: { type: String, required: true, unique: true},
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        validate: async function(value: mongoose.Types.ObjectId) {
            const user = await mongoose.model('User').findById(value);
            if(!user) {
                throw new Error('User not found');
            }
        }
    }
})

export const userModel = mongoose.model('User', userSchema);
export const tagModel = mongoose.model('Tag', tagSchema);
export const contentModel = mongoose.model('Content', contentSchema);
export const linkModel = mongoose.model('Link', linkSchema);






