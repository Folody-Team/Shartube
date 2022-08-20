// @ts-check

import { GraphQLError, GraphQLScalarType } from "graphql";

import Upload from "./Upload";


const GraphQLUpload = new GraphQLScalarType({
  name: "Upload",
  description: "The `Upload` scalar type represents a file upload.",
  parseValue(value) {
    if (value instanceof Upload) return value.promise;
    throw new GraphQLError("Upload value invalid.");
  },
  parseLiteral(node) {
    throw new GraphQLError("Upload literal unsupported.", { nodes: node });
  },
  serialize() {
    throw new GraphQLError("Upload serialization unsupported.");
  },
});

export default GraphQLUpload;
