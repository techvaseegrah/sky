import mongoose, { Schema } from 'mongoose';

// டேபிளில் உள்ள ஒவ்வொரு வரிசைக்குமான Schema
const LiquorPurchaseItemSchema = new Schema({
    shortCode: String,
    category: String,
    product: String,
    subProduct: String,
    caseQty: String,
    bot: String,
    qty: Number,
    basic: String,
    sRate: Number,
    amount: Number,
});

// முழு Invoice-க்குமான Schema
const LiquorPurchaseSchema = new Schema(
    {
        supplierName: { type: String, required: true },
        invoiceNo: { type: String, required: true },
        date: { type: Date, required: true },
        purchaseAccount: String,
        godown: String,
        items: [LiquorPurchaseItemSchema], // மேலே உள்ள item schema-வை இங்கே ஒரு array ஆகச் சேர்க்கிறோம்
    },
    {
        timestamps: true, // createdAt, updatedAt தானாகவே சேரும்
    }
);

const LiquorPurchase = mongoose.models.LiquorPurchase || mongoose.model("LiquorPurchase", LiquorPurchaseSchema);

export default LiquorPurchase;