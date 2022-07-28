import { gql } from 'https://deno.land/x/graphql_tag/mod.ts'

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
	extend type Mutation {
		Login(input: LoginUserInput!): UserLoginOrRegisterResponse!
		Register(input: RegisterUserInput!): UserLoginOrRegisterResponse!
	}

	extend type Query {
		Me: User!
	}
`
