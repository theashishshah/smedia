import mongoose, { Schema, model, models } from "mongoose";

export interface IMessage {
    _id?: mongoose.Types.ObjectId;
    senderId: string;
    receiverId: string;
    text: string;
    read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        senderId: { type: String, required: true, index: true },
        receiverId: { type: String, required: true, index: true },
        text: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes for faster querying of conversations
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = models?.Message || model<IMessage>("Message", messageSchema);
export default Message;
