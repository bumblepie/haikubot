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
}`;

exports.searchHaikusQuery = `
query searchHaikus($serverId: String!, $keywords: [String!]){
  searchHaikus(serverId: $serverId, keywords: $keywords) {
    id
    authors
    lines
    timestamp
  }
}`;

exports.deleteHaikuMutation = `
mutation deleteHaiku($serverId: String!, $haikuId: String!){
  deleteHaiku(serverId: $serverId, id: $haikuId)
}`;

exports.getHaikusInServerQuery = `
query getHaikusInServer($serverId: String!){
  getServer(id: $serverId) {
    haikus {
      id
      server {
        id
      }
      authors
      lines
      timestamp
    }
  }
}`;
