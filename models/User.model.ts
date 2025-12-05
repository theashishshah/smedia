import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
    _id?: mongoose.Types.ObjectId;
    email: string;
    name?: string;
    username?: string;
    bio?: string;
    image?: string;

    provider: "credentials" | "google";
    providerId?: string;

    password?: string; // optional because Google users don't have it

    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, index: true },
        name: { type: String },
        username: { type: String, unique: true, sparse: true },
        bio: { type: String, maxlength: 160 },
        image: { type: String },

        // mark how the account was created
        provider: {
            type: String,
            enum: ["credentials", "google"],
            default: "credentials",
            index: true,
        },
        providerId: { type: String },

        password: {
            type: String,
            select: false,
            required: function (this: any) {
                return this.provider === "credentials";
            },
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password") && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

export const User = models?.User || model<IUser>("User", userSchema);
