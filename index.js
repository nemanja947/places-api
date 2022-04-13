const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors(
  {
    origin: process.env.NODE_ENV === "development" ? "*" : /process.env.APP_DOMAIN$/
  }
))

const routes = require('./api/routes/routes')
routes(app)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening to port http://localhost:${port}`)
});
