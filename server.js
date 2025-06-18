const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
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
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
