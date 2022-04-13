const axios = require('axios')
const isEqual = require('lodash/isEqual')

const generateKeyForHoursObject = function (hours) {
  let key = ''
  hours.forEach(element => {
    key += `${element.start}-${element.end}`
  })
  return key
}

const formatOpeningHours = function (openingHours) {
  let daysOfWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  // find days with same opening hours
  let groupedDays = {}
  Object.keys(openingHours.days).reduce((previous, current) => {
    if (isEqual(openingHours.days[previous], openingHours.days[current])) {
      let key = generateKeyForHoursObject(openingHours.days[current])

      if (!groupedDays[key]) {
        groupedDays[key] = []
      }

      if (!groupedDays[key].includes(previous)) {
        groupedDays[key].push(previous)
      }
      groupedDays[key].push(current)
      return previous
    } else {
      return current
    }
  })

  // check for non existing days and transform days to new array
  let daysArray = []
  for (let day of daysOfWeek) {
    if (!openingHours.days[day]) {
      daysArray.push({day: day, type: 'CLOSED' })
    } else {
      let groupKey = generateKeyForHoursObject(openingHours.days[day])
      if (groupedDays[groupKey] && groupedDays[groupKey][0] === day) {
        daysArray.push({day: `${day} - ${groupedDays[groupKey][groupedDays[groupKey].length - 1]}`, hours: openingHours.days[day] })
      } else if (!groupedDays[groupKey] || !groupedDays[groupKey].includes(day)) {
        daysArray.push({day: day, hours: openingHours.days[day] })
      }
    }
  }

  return daysArray
}

const controller = {
  getPlaceById: async (req, res) => {
    try {
      let response = await axios.get(`${process.env.API_DOMAIN}/coding-session-rest-api/${req.params.id}`)
      let place = response.data
      let contacts = place.addresses[0].contacts.map(contact => {
        const {contact_type, call_link} = contact
        return {contact_type, call_link}
      })
      let placeFormated = {
        displayed_what: place.displayed_what,
        displayed_where: place.displayed_where,
        location: {
          lat: place.addresses[0].where.geography.location.lat,
          lng: place.addresses[0].where.geography.location.lon
        },
        ratings_count: place.place_feedback_summary.ratings_count,
        rating_summaries: place.place_feedback_summary.rating_summaries,
        contacts: contacts,
        opening_hours: formatOpeningHours(place.opening_hours)
      }
      res.json({ status: 'OK', place: placeFormated })
    } catch (e) {
      if (e.response && e.response.status === 404) {
        res.json({ status: 'ERROR', message: 'Place not found' })
      } else if (e.response) {
        res.json({ status: e.response.status, message: e.response.statusText })
      } else {
        res.json({ status: 'ERROR', message: 'Something went wrong' })
      }
    }
  }
}

module.exports = controller
