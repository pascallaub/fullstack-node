const winston = require("winston");

const logger = winston.createLogger({
  level: "info", // Oder je nach NODE_ENV
  format: winston.format.json(),
  defaultMeta: { service: "mini-notizblock-backend" },
  transports: [
    // Füge mindestens einen Transport hinzu!
    new winston.transports.Console({
      format: winston.format.combine( // Optional: Lesbareres Format für die Konsole
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Optional: File transport, etc.
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = logger;
