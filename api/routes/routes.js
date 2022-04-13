
const controller = require('../controllers/controller')

module.exports = (app) => {
  app.get('/places/:id', controller.getPlaceById)
}