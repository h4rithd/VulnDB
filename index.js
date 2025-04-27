const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the template engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "public"));

// Load vulnerabilities JSON
const filePath = path.join(__dirname, "data", "vulnerabilities.json");

function readVulnerabilities() {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeVulnerabilities(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Routes
// Home/ Search Page
app.get("/", (req, res) => {
  res.render("index");
});

// Search vulnerabilities (AJAX endpoint for autosuggest)
app.get("/search", (req, res) => {
  const searchQuery = req.query.q || "";
  const vulnerabilities = readVulnerabilities();

  const filtered = vulnerabilities.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  res.json(filtered);
});

// Submit vulnerability
app.get("/submit", (req, res) => {
  res.render("submit");
});

app.post("/submit", (req, res) => {
  const { name, issueBackground, issueDetail, relatedLinks } = req.body;
  const vulnerabilities = readVulnerabilities();

  vulnerabilities.push({
    name,
    issueBackground,
    issueDetail,
    relatedLinks: relatedLinks.split(","),
  });

  writeVulnerabilities(vulnerabilities);
  res.redirect("/");
});

// Connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
