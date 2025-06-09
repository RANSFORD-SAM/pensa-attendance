const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load attendees from JSON file
function loadAttendees() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "public", "attendees.json"), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save attendees to JSON file
function saveAttendees(attendees) {
  fs.writeFileSync(
    path.join(__dirname, "public", "attendees.json"),
    JSON.stringify(attendees, null, 2)
  );
}

// Calculate distance between two coordinates (in meters)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
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

// Endpoint to get list of attendees
app.get("/attendees", (req, res) => {
  const attendees = loadAttendees();
  res.json(attendees);
});

// Endpoint to handle attendance form submission
app.post("/submit", (req, res) => {
  const name = req.body.name?.trim();
  const userLat = parseFloat(req.body.latitude);
  const userLng = parseFloat(req.body.longitude);

  const CHURCH_LOCATION = { lat: 5.614818, lng: -0.205874 };
  const MAX_DISTANCE_METERS = 100;

  // Validation checks
  if (!name) return res.status(400).send("Name is required.");
  if (isNaN(userLat) || isNaN(userLng)) return res.status(400).send("Location is required.");

  const distance = getDistanceMeters(userLat, userLng, CHURCH_LOCATION.lat, CHURCH_LOCATION.lng);

  if (distance > MAX_DISTANCE_METERS) {
    return res.status(403).send("You are too far from the church location.");
  }

  const attendees = loadAttendees();
  const existing = attendees.find(a => a.name.toLowerCase() === name.toLowerCase());

  // Prevent duplicates
  if (existing && existing.present) {
    return res.status(409).send("You have already registered.");
  }

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
  console.log(`Server is running at http://localhost:${PORT}`);
});
