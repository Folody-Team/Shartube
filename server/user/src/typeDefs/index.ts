import { gql } from 'https://deno.land/x/oak_graphql/mod.ts'

export const typeDefs = (gql as any)`
	type Query{
        _empty: String
    }
    type Mutation {
        _empty: String
    }
	scalar Time
	directive @key(
		fields: String!
	) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION | OBJECT
	input RegisterUserInput {
		username: String!
		email: String!
		password: String!
	}
	input LoginUserInput {
		UsernameOrEmail: String!
		password: String!
	}
	type User @key(fields: "_id") {
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
	extend type Mutation {
		Login(input: LoginUserInput!): UserLoginOrRegisterResponse!
		Register(input: RegisterUserInput!): UserLoginOrRegisterResponse!
	}
	extend type Query {
		Me: User!
	}
`
