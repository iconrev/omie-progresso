const Tracker = require('../services/tracker/index');


exports.main = async (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const track = new Tracker(event);

  if (event.httpMethod === 'GET') {
    if (event.resource.includes('pixel')) {      
      return track.pixel()
    }
  }

}