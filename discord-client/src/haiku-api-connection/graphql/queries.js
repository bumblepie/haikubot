exports.createHaikuMutation = `
mutation createHaiku($haiku: HaikuInput) {
  createHaiku(haikuInput: $haiku) {
    id
    authors
    lines
    timestamp
  }
}`;

exports.getHaikuByIdQuery = `
query getHaikuById($serverId: String!, $haikuId: String!){
  getHaiku(serverId: $serverId, id: $haikuId) {
    id
    authors
    lines
    timestamp
  }
}
`;
