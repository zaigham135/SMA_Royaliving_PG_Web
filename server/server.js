import express from "express";
import cors from "cors";
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Student from "./models/Student.js";
import Counter from "./models/Counter.js";
import ExcelJS from "exceljs";
import ImageKit from "imagekit";

const app = express();
app.use(cors());
app.use(express.json());

// Load environment
dotenv.config()

// ImageKit configuration (only instantiate when credentials are provided)
let imagekit = null
// Instantiate ImageKit when real credentials are provided.
// Previously this checked for specific placeholder strings and incorrectly skipped when real keys matched those strings.
if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  })
  console.log('✅ ImageKit initialized')
} else {
  console.warn('⚠️ ImageKit is not configured. Image uploads/deletes will be skipped.')
}

// Helper to validate ImageKit fileId values before calling deleteFile
const isValidImageKitFileId = (fileId) => {
  if (!fileId || typeof fileId !== 'string') return false
  // Skip local blob ids or placeholder ids
  if (fileId.startsWith('local_')) return false
  if (fileId.startsWith('blob:')) return false
  // ImageKit fileId should not be a full URL or contain path segments
  if (/^https?:\/\//i.test(fileId)) return false
  if (fileId.includes('/')) return false
  // Minimal length check
  if (fileId.length < 5) return false
  return true
}

// Helper: ensure a returned image path is a full URL (prefix with urlEndpoint when needed)
const buildFullImageUrl = (maybeUrl) => {
  if (!maybeUrl) return ''
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl
  const base = process.env.IMAGEKIT_URL_ENDPOINT || ''
  if (!base) return maybeUrl
  // ensure we don't end up with duplicate slashes
  return base.replace(/\/$/, '') + (maybeUrl.startsWith('/') ? maybeUrl : '/' + maybeUrl)
}

// Helper: produce ImageKit path-based transform URL for thumbnails
const makeOptimizedUrl = (url, width = 400, height = 400, quality = 80) => {
  if (!url) return ''
  try {
    if (url.startsWith('blob:')) return url
    const parsed = new URL(url)
    if (parsed.hostname.includes('imagekit.io')) {
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) {
        const id = parts.shift()
        const rest = parts.join('/')
        parsed.pathname = `/${id}/tr:w-${width},h-${height},q-${quality}/${rest}`
        return parsed.toString()
      }
    }
    return url
  } catch (err) {
    return url
  }
}

// Helper: detect obviously invalid image entries (blob URLs, local placeholders)
const isInvalidStoredImage = (img) => {
  if (!img) return false
  const { url, fileId, optimizedUrl } = img
  if (!url && !fileId) return false
  if (fileId && typeof fileId === 'string' && fileId.startsWith('local_')) return true
  if (typeof url === 'string' && url.includes('blob:')) return true
  if (typeof optimizedUrl === 'string' && optimizedUrl.includes('blob:')) return true
  if (typeof url === 'string' && url.includes('localhost')) return true
  return false
}

// Diagnostic endpoint: list students with invalid image records
app.get('/api/imagekit/invalid-images', async (req, res) => {
  try {
    const students = await Student.find().lean()
    const invalid = students.filter(s => isInvalidStoredImage(s.profileImage))
      .map(s => ({ id: s._id, name: s.name, profileImage: s.profileImage }))
    res.json({ count: invalid.length, items: invalid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Cleanup endpoint: clear profileImage for provided student ids (useful to force re-upload)
app.post('/api/imagekit/invalid-images/clear', async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' })
    const result = await Student.updateMany(
      { _id: { $in: ids } },
      { $set: { profileImage: null } }
    )
    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Connect to MongoDB (use centralized config)
connectDB()

// ImageKit authentication endpoint
app.get("/api/imagekit/auth", (req, res) => {
  if (!imagekit) {
    return res.status(501).json({ error: 'ImageKit not configured on server' })
  }
  try {
    const auth = imagekit.getAuthenticationParameters()
  // include publicKey and urlEndpoint so clients can perform direct uploads
  res.json({ ...auth, publicKey: process.env.IMAGEKIT_PUBLIC_KEY, urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT })
  } catch (err) {
    console.error('ImageKit auth error', err)
    res.status(500).json({ error: 'Failed to get ImageKit auth parameters' })
  }
});

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    let students = await Student.find().sort({ createdAt: -1 });

    // Normalize image URLs for client consumption
    students = students.map(s => {
      const obj = s.toObject ? s.toObject() : s
      if (obj.profileImage) {
        obj.profileImage.url = buildFullImageUrl(obj.profileImage.url)
        obj.profileImage.optimizedUrl = makeOptimizedUrl(obj.profileImage.url)
      }
      if (obj.documents && Array.isArray(obj.documents)) {
        obj.documents = obj.documents.map(d => ({
          ...d,
          url: buildFullImageUrl(d.url)
        }))
      }
    
      return obj
    })

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new student
app.post("/api/students", async (req, res) => {
  try {
    if (req.body._id) { delete req.body._id; }
    
    // Generate serial number
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

// Update student
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete images from ImageKit if they exist and look valid
    if (imagekit && student.profileImage?.fileId) {
      if (isValidImageKitFileId(student.profileImage.fileId)) {
        try {
          await imagekit.deleteFile(student.profileImage.fileId);
        } catch (error) {
          console.error('Error deleting profile image:', error);
        }
      } else {
        console.log('Skipping delete of invalid profileImage.fileId:', student.profileImage.fileId)
      }
    }

      if (student.documents && student.documents.length > 0) {
        for (const doc of student.documents) {
          if (imagekit && doc.fileId) {
            if (isValidImageKitFileId(doc.fileId)) {
              try {
                await imagekit.deleteFile(doc.fileId);
              } catch (error) {
                console.error('Error deleting document:', error);
              }
            } else {
              console.log('Skipping delete of invalid document.fileId:', doc.fileId)
            }
          }
        }
      }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk delete students
app.post("/api/students/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    
    // Get students to delete their images
    const students = await Student.find({ _id: { $in: ids } });
    
    // Delete images from ImageKit
    for (const student of students) {
      if (student.profileImage?.fileId) {
        if (isValidImageKitFileId(student.profileImage.fileId)) {
          try {
            await imagekit.deleteFile(student.profileImage.fileId);
          } catch (error) {
            console.error('Error deleting profile image:', error);
          }
        } else {
          console.log('Skipping delete of invalid profileImage.fileId:', student.profileImage.fileId)
        }
      }

      if (student.documents && student.documents.length > 0) {
        for (const doc of student.documents) {
          if (doc.fileId) {
            if (isValidImageKitFileId(doc.fileId)) {
              try {
                await imagekit.deleteFile(doc.fileId);
              } catch (error) {
                console.error('Error deleting document:', error);
              }
            } else {
              console.log('Skipping delete of invalid document.fileId:', doc.fileId)
            }
          }
        }
      }
    }

    await Student.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} students deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server-side ImageKit delete endpoint (client can call this to remove files)
app.post('/api/imagekit/delete', async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ error: 'fileId is required' });
    if (!imagekit) return res.status(501).json({ error: 'ImageKit not configured on server' });

    await imagekit.deleteFile(fileId);
    res.json({ success: true });
  } catch (err) {
    console.error('ImageKit delete endpoint error', err);
    res.status(500).json({ error: err.message });
  }
});

// Add sample data
app.post("/seed", async (req, res) => {
  try {
    const sampleStudents = [
      {
        name: "Rahul Kumar",
        phone: "9876543210",
        room: "A1",
        join_date: new Date("2024-01-15"),
        fee_due: 5000,
        college: "Delhi University",
        section: "B.Tech CSE",
        temp_address: {
          street: "123 Main Street",
          city: "New Delhi",
          state: "Delhi",
          pin: "110001"
        },
        perm_address: {
          street: "456 Village Road",
          city: "Patna",
          state: "Bihar",
          pin: "800001"
        },
        parent: {
          name: "Rajesh Kumar",
          phone: "8765432109",
          relation: "Father"
        },
        notes: "Sample student data"
      },
      {
        name: "Priya Sharma",
        phone: "8765432109",
        room: "B2",
        join_date: new Date("2024-01-20"),
        fee_due: 4500,
        college: "JNU",
        section: "M.A. English",
        temp_address: {
          street: "789 Park Avenue",
          city: "New Delhi",
          state: "Delhi",
          pin: "110067"
        },
        perm_address: {
          street: "321 Lake View",
          city: "Mumbai",
          state: "Maharashtra",
          pin: "400001"
        },
        parent: {
          name: "Sunita Sharma",
          phone: "7654321098",
          relation: "Mother"
        },
        notes: "Another sample student"
      }
    ];

    for (const studentData of sampleStudents) {
      const counter = await Counter.findOneAndUpdate(
        { key: "student_serial" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      const student = new Student({ ...studentData, serial: counter.seq });
      await student.save();
    }

    res.json({ message: "Sample data added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export to Excel
app.get("/api/export", async (req, res) => {
  try {
    const students = await Student.find().sort({ serial: 1 });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");
    
    worksheet.columns = [
      { header: "ID", key: "displayId", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "College", key: "college", width: 30 },
      { header: "Section", key: "section", width: 20 },
      { header: "Room", key: "room", width: 10 },
      { header: "Join Date", key: "join_date", width: 15 },
      { header: "Fee Due", key: "fee_due", width: 12 },
      { header: "Notes", key: "notes", width: 30 }
    ];
    
    students.forEach(student => {
      worksheet.addRow({
        displayId: student.displayId,
        name: student.name,
        phone: student.phone,
        college: student.college || '',
        section: student.section || '',
        room: student.room,
        join_date: student.join_date.toISOString().split('T')[0],
        fee_due: student.fee_due,
        notes: student.notes || ''
      });
    });
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=students.xlsx"
    );
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
