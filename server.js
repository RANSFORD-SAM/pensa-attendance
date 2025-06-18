const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const membersPath = path.join(__dirname, "public", "members.json");
const attendeesPath = path.join(__dirname, "public", "attendees.json");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the files exist
if (!fs.existsSync(membersPath)) fs.writeFileSync(membersPath, "[]");
if (!fs.existsSync(attendeesPath)) fs.writeFileSync(attendeesPath, "[]");

app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required." });
  }

  try {
    let members = JSON.parse(fs.readFileSync(membersPath));
    let attendees = JSON.parse(fs.readFileSync(attendeesPath));

    if (!members.includes(name)) {
      members.push(name);
      fs.writeFileSync(membersPath, JSON.stringify(members, null, 2));
    }

    if (!attendees.includes(name)) {
      attendees.push(name);
      fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));
    }

    res.status(200).json({ success: true, message: "Successfully registered." });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ success: false, message: "Server error occurred." });
  }
});

app.get("/attendees", (req, res) => {
  try {
    const attendees = JSON.parse(fs.readFileSync(attendeesPath));
    res.json({ count: attendees.length, attendees });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to read attendees." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
