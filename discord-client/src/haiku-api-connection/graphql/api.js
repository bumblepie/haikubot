const requestPromise = require('request-promise');
const queryFactory = require('./queryFactory');
const { graphqlApiBaseUrl } = require('../../secrets');

exports.saveHaiku = (haiku) => {
  const requestBody = queryFactory.createHaikuMutation(haiku);
  const requestOptions = {
    method: 'POST',
    url: graphqlApiBaseUrl,
    json: true,
    body: requestBody,
  };

  request(requestOptions, (err, res, body) => {
    if (err != null) {
      console.log('Error saving haiku.');
      console.log(` request body: ${JSON.stringify(requestBody)}`);
      console.log(` err: ${err}`);
      console.log(` response body: ${body}`);
    } else {
      const responseHaiku = body.data.createHaiku;
      channel.send(formatHaiku(responseHaiku));
    }
  });
}

exports.getHaikuById = (haikuId) => {
  const requestBody = queryFactory.getHaikuByIdQuery(haikuId);
  const requestOptions = {
    method: 'POST',
    url: graphqlApiBaseUrl,
    json: true,
    body: requestBody,
  };
  console.log(JSON.stringify(requestOptions));
  request(requestOptions, (err, res, body) => {
    if (err != null) {
      console.log('Error fetching haiku.');
      console.log(` request body: ${JSON.stringify(requestBody)}`);
      console.log(` err: ${err}`);
      console.log(` response body: ${body}`);
    } else {
      console.log(` response body: ${JSON.stringify(body)}`);
      const responseHaiku = body.data.getHaiku;
      channel.send(formatHaiku(responseHaiku));
    }
  });
}
