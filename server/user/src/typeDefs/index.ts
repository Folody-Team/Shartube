import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";

export const typeDefs = gql`
  scalar Time
  input RegisterUserInput {
    username: String!
    email: String!
    password: String!
  }
  input LoginUserInput {
    UsernameOrEmail: String!
    password: String!
  }
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String
    createdAt: Time!
    updatedAt: Time!
  }
  type UserLoginOrRegisterResponse {
    user: User!
    accessToken: String!
  }
  type Mutation {
    Login(input: LoginUserInput!): UserLoginOrRegisterResponse!
    Register(input: RegisterUserInput!): UserLoginOrRegisterResponse!
  }
  type Query {
    Me: User!
  }
`;
