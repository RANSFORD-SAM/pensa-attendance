const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// File paths
const membersPath = path.join(__dirname, "public", "members.json");
const attendeesPath = path.join(__dirname, "public", "attendees.json");

// Ensure files exist
function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }
}
ensureFile(membersPath);
ensureFile(attendeesPath);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST /submit
app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required." });
  }

  try {
    let members = JSON.parse(fs.readFileSync(membersPath, "utf8"));
    let attendees = JSON.parse(fs.readFileSync(attendeesPath, "utf8"));

    // Ensure both are arrays
    if (!Array.isArray(members)) members = [];
    if (!Array.isArray(attendees)) attendees = [];

    // Save to permanent list if not already in
    if (!members.includes(name)) {
      members.push(name);
      fs.writeFileSync(membersPath, JSON.stringify(members, null, 2));
    }

    // Mark present for this service
    if (!attendees.includes(name)) {
      attendees.push(name);
      fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));
    }

    res.json({ success: true, message: "Registration successful!" });
  } catch (err) {
    console.error("ERROR in /submit:", err);
    res.status(500).json({ success: false, message: "Server error occurred." });
  }
});

// GET /attendees
app.get("/attendees", (req, res) => {
  try {
    const attendees = JSON.parse(fs.readFileSync(attendeesPath, "utf8"));
    res.json({ count: attendees.length, attendees });
  } catch (err) {
    console.error("ERROR reading attendees:", err);
    res.status(500).json({ success: false, message: "Could not load attendees." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
