// src/models/ReportLog.ts
import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IReportLog extends Document {
  status: 'Success' | 'Failure';
  message: string;
  sentAt: Date;
}

const ReportLogSchema: Schema = new Schema({
  status: { type: String, required: true, enum: ['Success', 'Failure'] },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const ReportLog = models.ReportLog || model<IReportLog>('ReportLog', ReportLogSchema);

export default ReportLog;