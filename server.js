const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 10000;

// Serve static files from the public directory
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load existing attendees
function loadAttendees() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "public", "attendees.json"), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save attendees to file
function saveAttendees(attendees) {
  fs.writeFileSync(
    path.join(__dirname, "public", "attendees.json"),
    JSON.stringify(attendees, null, 2)
  );
}

// Calculate distance between two coordinates in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==========================
// ROUTES
// ==========================

// Get attendees list
app.get("/attendees", (req, res) => {
  const attendees = loadAttendees();
  res.json(attendees);
});

// Submit name with location validation
app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();
  const userLat = parseFloat(req.body.latitude);
  const userLng = parseFloat(req.body.longitude);

  // 🎯 Precise location of PENSA UEW (from OpenStreetMap)
  const CHURCH_LOCATION = { lat: 5.33888, lng: -0.62795 };
  const MAX_DISTANCE_METERS = 100;

  if (!name) return res.status(400).send("Name is required.");
  if (isNaN(userLat) || isNaN(userLng)) return res.status(400).send("Location is required.");

  const distance = getDistanceMeters(userLat, userLng, CHURCH_LOCATION.lat, CHURCH_LOCATION.lng);
  if (distance > MAX_DISTANCE_METERS) {
    return res.status(403).send("You are too far from the church location.");
  }

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
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
