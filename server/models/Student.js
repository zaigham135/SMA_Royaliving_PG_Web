import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  room: { type: String, required: true },
  join_date: { type: Date, required: true },
  fee_due: { type: Number, default: 0 },
  notes: { type: String },
  college: { type: String },
  section: { type: String },
  temp_address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pin: { type: String },
  },
  perm_address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pin: { type: String },
  },
  parent: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String },
  },
  serial: { type: Number, unique: true }, // For sequential SMA-IDs
  // Image fields for ImageKit
  profileImage: {
    url: { type: String },
    fileId: { type: String },
    name: { type: String },
    optimizedUrl: { type: String }
  },
  documents: [{
    type: { type: String, enum: ['aadhar', 'pan', 'college_id', 'other'] },
    url: { type: String },
    fileId: { type: String },
    name: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Transform to include displayId
studentSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    ret.displayId = ret.serial != null ? `SMA-${String(ret.serial).padStart(5, '0')}` : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
