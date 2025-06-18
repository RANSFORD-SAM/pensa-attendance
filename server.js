const express = require("express");
const fs = require("fs");
const path = require("path");
<<<<<<< HEAD
=======

>>>>>>> 392df4134523e98c3ca15013e12982fd27407141
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
<<<<<<< HEAD
app.use(express.urlencoded({ extended: true }));

// POST to register attendee
app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ success: false, message: "Name is required" });

  const filePath = path.join(__dirname, "public", "attendees.json");

  fs.readFile(filePath, "utf8", (err, jsonData) => {
    let attendees = [];
    if (!err && jsonData) {
      try {
        attendees = JSON.parse(jsonData);
      } catch {}
    }

    const existing = attendees.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
      attendees.push({ name });
      fs.writeFile(filePath, JSON.stringify(attendees, null, 2), err => {
        if (err) return res.status(500).json({ success: false, message: "Failed to save" });
        res.json({ success: true, message: "Registered successfully" });
      });
    } else {
      res.json({ success: true, message: "Already registered" });
    }
  });
});

// GET attendees for dashboard
app.get("/attendees", (req, res) => {
  const filePath = path.join(__dirname, "public", "attendees.json");
  fs.readFile(filePath, "utf8", (err, jsonData) => {
    let attendees = [];
    if (!err && jsonData) {
      try {
        attendees = JSON.parse(jsonData);
      } catch {}
    }
    res.json({ count: attendees.length, attendees });
  });
=======

const membersPath = path.join(__dirname, "public", "members.json");
const attendeesPath = path.join(__dirname, "public", "attendees.json");

// Ensure both files exist
if (!fs.existsSync(membersPath)) fs.writeFileSync(membersPath, "[]");
if (!fs.existsSync(attendeesPath)) fs.writeFileSync(attendeesPath, "[]");

app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    return res.status(400).send("Name is required.");
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
  }

  res.status(200).send("Successfully registered.");
>>>>>>> 392df4134523e98c3ca15013e12982fd27407141
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
