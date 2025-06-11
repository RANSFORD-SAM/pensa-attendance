const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load attendees from JSON
function loadAttendees() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "public", "attendees.json"), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save attendees to JSON
function saveAttendees(attendees) {
  fs.writeFileSync(path.join(__dirname, "public", "attendees.json"), JSON.stringify(attendees, null, 2));
}

// Routes
app.get("/attendees", (req, res) => {
  const attendees = loadAttendees();
  res.json(attendees);
});

app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();

  if (!name) return res.status(400).send("Name is required.");

  const attendees = loadAttendees();
  const existing = attendees.find(a => a.name.toLowerCase() === name.toLowerCase());

  if (existing) {
    existing.present = true;
  } else {
    attendees.push({ name, present: true });
  }

  saveAttendees(attendees);
  res.redirect("/form.html");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
