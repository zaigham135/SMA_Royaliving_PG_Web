import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import ExcelJS from "exceljs";

import connectDB from "./config/db.js";
import Student from "./models/Student.js";
import mongoose from "mongoose";
import Counter from "./models/Counter.js";

dotenv.config();

// Connect DB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/api/students", async (req, res) => {
  const students = await Student.find().sort({ _id: -1 });
  res.json(students);
});

app.post("/api/students", async (req, res) => {
  try {
    // agar req.body mein _id hai to delete kar do
    if (req.body._id) {
      delete req.body._id;
    }

    // assign next serial atomically
    const counter = await Counter.findOneAndUpdate(
      { key: "student_serial" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const student = new Student({ ...req.body, serial: counter.seq });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.put("/api/students/:id", async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ deleted: true });
});

// Bulk delete
app.post("/api/students/bulk-delete", async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (ids.length === 0) return res.status(400).json({ error: "No ids provided" });
    // Optional debug
    // console.log("bulk-delete ids:", ids);

    const objectIds = [];
    for (const id of ids) {
      try {
        objectIds.push(new mongoose.Types.ObjectId(String(id)));
      } catch (_) {
        // skip invalid id
      }
    }
    if (objectIds.length === 0) return res.status(400).json({ error: "No valid ids provided" });
    const result = await Student.deleteMany({ _id: { $in: objectIds } });
    res.json({ deleted: result.deletedCount || 0 });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Excel Export Route
app.get("/api/export", async (req, res) => {
  const rows = await Student.find();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  // Define columns
  sheet.columns = [
    { header: "ID", key: "id", width: 25 },
    { header: "Name", key: "name", width: 20 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "College", key: "college", width: 20 },
    { header: "Section", key: "section", width: 12 },
    { header: "Room", key: "room", width: 10 },
    { header: "Join Date", key: "join_date", width: 15 },
    { header: "Fee Due", key: "fee_due", width: 10 },
    { header: "Notes", key: "notes", width: 30 },
    { header: "Fees Paid", key: "feesPaid", width: 10 }
  ];

  // Add rows
  rows.forEach(r => {
    const displayId = typeof r.serial === 'number' ? `SMA-${String(r.serial).padStart(5, '0')}` : (r._id ? r._id.toString() : "");
    sheet.addRow({
      id: displayId,
      name: r.name,
      phone: r.phone || "",
      college: r.college || "",
      section: r.section || "",
      room: r.room,
      join_date: r.join_date ? r.join_date.toISOString().split("T")[0] : "",
      fee_due: r.fee_due || 0,
      notes: r.notes || "",
      feesPaid: r.feesPaid ? "Yes" : "No"
    });
  });

  // Headers for Excel download
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
