const requestPromise = require('request-promise');
const queryFactory = require('./queryFactory');

class GraphqlApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  saveHaiku(haiku) {
    let responseHaiku = null;
    const requestBody = queryFactory.createHaikuMutation(haiku);
    const requestOptions = {
      method: 'POST',
      url: this.baseUrl,
      json: true,
      body: requestBody,
    };

    return new Promise(function (resolve, reject) {
      requestPromise(requestOptions)
        .then((body) => {
          const responseHaiku = body.data.createHaiku;
          resolve(responseHaiku);
        })
        .catch((error) => {
          console.log('Error saving haiku.');
          console.log(` request body: ${JSON.stringify(requestBody)}`);
          console.log(` err: ${err}`);
          console.log(` response body: ${body}`);
          reject('Error saving haiku');
        });
      });
  }

getHaikuById(haikuId) {
  const requestBody = queryFactory.getHaikuByIdQuery(haikuId);
  const requestOptions = {
    method: 'POST',
    url: this.baseUrl,
    json: true,
    body: requestBody,
  };
  return new Promise((resolve, reject) => {
    requestPromise(requestOptions)
      .then((body) => {
        const responseHaiku = body.data.getHaiku;
        resolve(responseHaiku);
      })
      .catch((error) => {
        console.log('Error fetching haiku.');
        console.log(` request body: ${JSON.stringify(requestBody)}`);
        console.log(` err: ${err}`);
        console.log(` response body: ${body}`);
      });
    });
  }
}

exports.GraphqlApi = GraphqlApi;
