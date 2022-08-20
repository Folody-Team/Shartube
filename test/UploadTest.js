const query =
  `mutation AddImagesForChap($req: [UploadFile!]!, $chapId: String!){ 
    AddImageToChap(req: $req, chapID: $chapId) {
        name,
        description,
        _id,
        Images {
          ID,
          Url,
        }
    }  
}`
    .replace(/\n/g, " ")
    .replace(/\s\s+/g, " ");

let variables = {
  req: [
    {
      id: 0,
      file: null,
    },
  ],
  chapId: "62f214d12f65a1c30146eb1e",
};
/**
 * @param  {{
 *   [key: number]: string[];
 * }} map
 */
const makeMap = (map) => {
  let result = {};
  for (let key in map) {
    result[key] = map[key].map((value) => "variables." + value);
  }
  return result;
};
let map = {
  0: ["req.0.file"].map((key) => "variables." + key),
};
map = makeMap(map);

console.log({
  operations: JSON.stringify({
    query,
    variables,
    operationName: "AddImageToChap",
  }),
  map: JSON.stringify(map),
});
