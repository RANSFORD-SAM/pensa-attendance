const express = require("express");

const fs = require("fs");
const XLSX = require("xlsx");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

// File paths
const membersPath = path.join(__dirname, "public", "members.json");
const attendeesPath = path.join(__dirname, "public", "attendees.json");

// Ensure the JSON files exist
if (!fs.existsSync(membersPath)) fs.writeFileSync(membersPath, "[]");
if (!fs.existsSync(attendeesPath)) fs.writeFileSync(attendeesPath, "[]");

// Submit endpoint
app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();

  if (!name) return res.status(400).send("Name is required.");

  let members = [];
  let attendees = [];

  try {
    members = JSON.parse(fs.readFileSync(membersPath));
    attendees = JSON.parse(fs.readFileSync(attendeesPath));
  } catch (err) {
    return res.status(500).send("Failed to read data.");
  }

  // Add to members if new
  if (!members.includes(name)) {
    members.push(name);
    fs.writeFileSync(membersPath, JSON.stringify(members, null, 2));
  }

  // Add to attendees if not already marked
  if (!attendees.includes(name)) {
    attendees.push(name);
    fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));
    return res.send("You have been marked present.");
  } else {
    return res.send("You were already marked present.");
  }
});

// Return list of today's attendees
app.get("/attendees", (req, res) => {
  try {
    const attendees = JSON.parse(fs.readFileSync(attendeesPath));
    res.json({ count: attendees.length, attendees: attendees.map(name => ({ name })) });
  } catch (err) {
    res.status(500).send("Error reading attendees.");
  }
});
// Export attendees to Excel
app.get("/export", (req, res) => {
  const filePath = path.join(__dirname, "public", "attendees.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Failed to read attendees.");

    let attendees = [];
    try {
      attendees = JSON.parse(data);
    } catch {
      return res.status(500).send("Invalid attendee data.");
    }

    const worksheet = XLSX.utils.json_to_sheet(attendees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=attendees.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
