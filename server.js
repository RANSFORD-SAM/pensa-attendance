const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const membersPath = path.join(__dirname, "public", "members.json");
const attendeesPath = path.join(__dirname, "public", "attendees.json");

// Ensure both files exist
if (!fs.existsSync(membersPath)) fs.writeFileSync(membersPath, "[]");
if (!fs.existsSync(attendeesPath)) fs.writeFileSync(attendeesPath, "[]");

// POST to register attendee
app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required." });
  }

  let members = JSON.parse(fs.readFileSync(membersPath));
  let attendees = JSON.parse(fs.readFileSync(attendeesPath));

  // Add to members.json if new
  if (!members.includes(name)) {
    members.push(name);
    fs.writeFileSync(membersPath, JSON.stringify(members, null, 2));
  }

  // Add to attendees.json if not already marked present
  if (!attendees.includes(name)) {
    attendees.push(name);
    fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));
    return res.json({ success: true, message: "Successfully registered." });
  } else {
    return res.json({ success: true, message: "Already marked present." });
  }
});

// GET attendees for dashboard
app.get("/attendees", (req, res) => {
  const attendees = JSON.parse(fs.readFileSync(attendeesPath));
  res.json({ count: attendees.length, attendees: attendees.map(name => ({ name })) });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
