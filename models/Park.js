import mongoose from 'mongoose';

const parkSchema = new mongoose.Schema({
        name: {type: String, required: true},
        state: {type: String, required: true},
        location: {type: String, required: true},
        parkType: {type: String, required: true},
        trails: {type: String, required: true},
        activities: {type: String, required: true},
        openingHours: {type: String, required: true},

    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform:
                (doc, ret) => {

                    ret._links = {
                        self: {
                            href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks/${ret._id}`,
                        },
                        collection: {
                            href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks`,
                        },
                    };

                    delete ret._id;
                },
        }
    }
);

const Park = mongoose.model("Park", parkSchema);

export default Park;