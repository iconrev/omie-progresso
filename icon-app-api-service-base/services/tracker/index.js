const models = require('../../models');
const TrackerModel = models.Tracker;


class Tracker {

  constructor(event) {
    this._event = event
    this._headers = null;
    this._queryStringParameters = null;
    this._userAgent = null;
    this._sourceIp = null;
    this._utmSource = null;
    this._utmMedium = null;
    this._utmCampaign = null;
    this._utmId = null;
    this._utmTerm = null;
    this._utmContent = null;

    const { headers, queryStringParameters } = this._event;
    if (headers) {
      this.#trackingHeaders(headers)
    }
    if (queryStringParameters) {
      this.#trackingQueryStringParameters(queryStringParameters)
    }
  }

  get data() {
    return {
      'source_user_agent': this._userAgent || '-',
      'source_ip': this._sourceIp || '-',
      'utm_source': this._utmSource || '-',
      'utm_medium': this._utmMedium || '-',
      'utm_campaign': this._utmCampaign || '-',
      'utm_id': this._utmId || '-',
      'utm_term': this._utmTerm || '-',
      'utm_content': this._utmContent || '-'
    }
  }

  async #saveTracker() {
    try {
      const data = {
        ...this.data,
        'source_headers': this._headers,
      }
      const trackerData = await TrackerModel.create(data);
      console.info(trackerData)
    } catch (error) {
      console.error(error)
    }
  }

  #trackingHeaders(headers){
    this._headers = JSON.stringify(headers)
    this._userAgent = headers['User-Agent']
    this._sourceIp = headers['X-Forwarded-For']
    console.info(headers)
  };

  #trackingQueryStringParameters(params) {
  this._queryStringParameters = JSON.stringify(params)
    this._utmSource = params['utm_source']
    this._utmMedium = params['utm_medium']
    this._utmCampaign = params['utm_campaign']
    this._utmId = params['utm_id']
    this._utmTerm = JSON.stringify(params['utm_term'].split('-'))
    this._utmContent = params['utm_content']
    console.info(params)
  };

  async pixel() {

    await this.#saveTracker();

    return {
      "statusCode": 200,
      "headers": {
        'Content-Type': 'image/png'
      },
      "body": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "isBase64Encoded": true
    }
  }

}

module.exports = Tracker;