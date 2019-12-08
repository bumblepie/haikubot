const requestPromise = require('request-promise');
const queryFactory = require('./queryFactory');

class GraphqlApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  saveHaiku(haiku) {
    const requestBody = queryFactory.createHaikuMutation(haiku);
    const requestOptions = {
      method: 'POST',
      url: this.baseUrl,
      json: true,
      body: requestBody,
    };

    return new Promise((resolve, reject) => {
      requestPromise(requestOptions)
        .then((body) => {
          if ('errors' in body) {
            throw body.errors;
          }
          const responseHaiku = body.data.createHaiku;
          resolve(responseHaiku);
        })
        .catch((error) => {
          console.log('Error saving haiku.');
          console.log(` request body: ${JSON.stringify(requestBody)}`);
          console.log(` error: ${JSON.stringify(error)}`);
          reject(error);
        });
    });
  }

  getHaikuById(serverId, haikuId) {
    const requestBody = queryFactory.getHaikuByIdQuery(serverId, haikuId);
    const requestOptions = {
      method: 'POST',
      url: this.baseUrl,
      json: true,
      body: requestBody,
    };
    return new Promise((resolve, reject) => {
      requestPromise(requestOptions)
        .then((body) => {
          if ('errors' in body) {
            throw body.errors;
          }
          const responseHaiku = body.data.getHaiku;
          resolve(responseHaiku);
        })
        .catch((error) => {
          console.log('Error fetching haiku.');
          console.log(` request body: ${JSON.stringify(requestBody)}`);
          console.log(` error: ${JSON.stringify(error)}`);
          reject(error);
        });
    });
  }

  searchHaikus(serverId, keywords) {
    const requestBody = queryFactory.searchHaikusQuery(serverId, keywords);
    const requestOptions = {
      method: 'POST',
      url: this.baseUrl,
      json: true,
      body: requestBody,
    };
    return new Promise((resolve, reject) => {
      requestPromise(requestOptions)
        .then((body) => {
          if ('errors' in body) {
            throw body.errors;
          }
          const searchResults = body.data.searchHaikus;
          resolve(searchResults);
        })
        .catch((error) => {
          console.log('Error fetching haiku.');
          console.log(` request body: ${JSON.stringify(requestBody)}`);
          console.log(` error: ${JSON.stringify(error)}`);
          reject(error);
        });
    });
  }

  deleteHaiku(serverId, haikuId) {
    const requestBody = queryFactory.deleteHaikuMutation(serverId, haikuId);
    const requestOptions = {
      method: 'POST',
      url: this.baseUrl,
      json: true,
      body: requestBody,
    };
    return new Promise((resolve, reject) => {
      requestPromise(requestOptions)
        .then((body) => {
          if ('errors' in body) {
            throw body.errors;
          }
          resolve();
        })
        .catch((error) => {
          console.log('Error fetching haiku.');
          console.log(` request body: ${JSON.stringify(requestBody)}`);
          console.log(` error: ${JSON.stringify(error)}`);
          reject(error);
        });
    });
  }
}

exports.GraphqlApi = GraphqlApi;
