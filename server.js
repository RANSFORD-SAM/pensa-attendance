const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Paths to JSON files
const attendeesPath = path.join(__dirname, "public", "attendees.json");

// Create file if it doesn't exist
if (!fs.existsSync(attendeesPath)) {
  fs.writeFileSync(attendeesPath, "[]");
}

// Middlewares
app.use(express.static("public"));
app.use(express.json());

// Route to handle registration
app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  let attendees;
  try {
    attendees = JSON.parse(fs.readFileSync(attendeesPath));
  } catch (e) {
    attendees = [];
  }

  const alreadyPresent = attendees.some(a => a.name.toLowerCase() === name.toLowerCase());

  if (!alreadyPresent) {
    attendees.push({ name });
    fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));
    return res.json({ success: true, message: "Registered successfully" });
  } else {
    return res.json({ success: true, message: "Already registered" });
  }
});

// Route to return attendees for admin
app.get("/attendees", (req, res) => {
  let attendees = [];
  try {
    attendees = JSON.parse(fs.readFileSync(attendeesPath));
  } catch (e) {
    attendees = [];
  }

  res.json({ count: attendees.length, attendees });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
