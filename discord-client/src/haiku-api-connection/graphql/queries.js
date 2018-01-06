exports.createHaikuMutation = `
mutation createHaiku($haiku: HaikuInput) {
	createHaiku(haikuInput: $haiku) {
    id
    authors
    lines
  }
}`;

exports.getHaikuByIdQuery = `
query getHaikuById($haikuId: ID!){
  getHaiku(id: $haikuId) {
    id
    authors
    lines
  }
}
`;
