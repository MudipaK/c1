const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");
const logger = require("./utils/logger");
const helmet = require("helmet");

dotenv.config();
app.use(helmet());

const server = http.createServer(app);
// Start server
if (process.env.NODE_ENV === "test") {
  module.exports = server;
} else {
  const PORT = process.env.PORT || 5003;
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}
