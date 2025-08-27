import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  room: {
    type: String,
    required: true,
  },
  college: {
    type: String,
  },
  section: {
    type: String,
  },
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
  join_date: {
    type: Date,
    default: Date.now,   // UI se na mile to aaj ki date
  },
  fee_due: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
  feesPaid: {
    type: Boolean,
    default: false,
  },
  serial: {
    type: Number,
    index: true,
    unique: true,
  }
});

// id ko UI me as "id" dikhane ke liye transform
studentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;   // MongoDB ka _id => UI ka id
    if (typeof ret.serial === 'number') {
      ret.displayId = `SMA-${String(ret.serial).padStart(5, '0')}`;
    }
    delete ret._id;
  }
});

// Note: serial assignment handled in route to avoid double increments

const Student = mongoose.model("Student", studentSchema);

export default Student;
