exports.createHaikuMutation = `
mutation createHaiku($haiku: HaikuInput) {
  createHaiku(haiku: $haiku) {
    id
    author
    lines
  }
}`;

exports.getHaikuByIdQuery = `
query getHaikuById($haikuId: String){
  getHaiku(id: $haikuId) {
    id
    author
    lines
  }
}
`;
