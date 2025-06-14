const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

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
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
