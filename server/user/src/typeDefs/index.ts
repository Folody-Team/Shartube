import { gql } from 'https://deno.land/x/oak_graphql/mod.ts'

export const TypeDefsString = `
	type _Service {
		sdl: String
	}
	type Query {
		_service: _Service!
	}
	type Mutation {
		_empty: String
	}
	scalar Time
	scalar _FieldSet
	directive @key(fields: _FieldSet!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE
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
export const typeDefs = gql`
	${TypeDefsString}
`
