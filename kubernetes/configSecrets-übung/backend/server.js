const express = require("express");
const winston = require("winston");
const fs = require("fs");

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration values
const greetingMessage = process.env.GREETING_MESSAGE || "Hello from default";
const dbPassword = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;

const configFilePath = "/etc/app/config/app.properties";
const secretFilePath = "/etc/app/secrets/credentials.txt";

let configFileContent = "N/A";
let secretFileContent = "N/A";

try {
  if (fs.existsSync(configFilePath)) {
    configFileContent = fs.readFileSync(configFilePath, "utf8");
  } else {
    configFileContent = "File not found: " + configFilePath;
  }
} catch (err) {
  configFileContent = `Error reading ${configFilePath}: ${err.message}`;
}

try {
  if (fs.existsSync(secretFilePath)) {
    secretFileContent = fs.readFileSync(secretFilePath, "utf8");
  } else {
    secretFileContent = "File not found: " + secretFilePath;
  }
} catch (err) {
  secretFileContent = `Error reading ${secretFilePath}: ${err.message}`;
}

// Log configuration
logger.info("Application starting with the following configuration:");
logger.info(`PORT: ${PORT}`);
logger.info(`LOG_LEVEL: ${logger.level}`);
logger.info(`GREETING_MESSAGE: ${greetingMessage}`);
logger.info(`DB_PASSWORD: ${dbPassword ? "********" : "Not Set"}`);
logger.info(`API_KEY: ${apiKey ? "********" : "Not Set"}`);
logger.info(
  `Config File Path (${configFilePath}) Content: ${configFileContent}`
);
// For sensitive file content, log a placeholder or a non-sensitive part if applicable
// Here, we'll just indicate it's sensitive and its read status.
logger.info(
  `Secret File Path (${secretFilePath}) Content: ${
    secretFileContent !== "N/A" &&
    !secretFileContent.startsWith("Error") &&
    !secretFileContent.startsWith("File not found")
      ? "******** (Sensitive data read)"
      : secretFileContent
  }`
);

app.get("/", (req, res) => {
  res.send(
    `${greetingMessage} - App is running! Check logs for configuration details.`
  );
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
