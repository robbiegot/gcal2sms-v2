
const withTM = require("next-transpile-modules")([
  '@fullcalendar/react', 
  '@fullcalendar/daygrid', 
  '@fullcalendar/google-calendar',
  '@fullcalendar/timegrid', 
  '@fullcalendar/list'
]);

module.exports = withTM({});
