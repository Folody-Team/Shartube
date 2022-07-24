import {gql} from "@apollo/client";

export const registerMutation = gql`
mutation Register ($email: String!, $password: String!, $username: String!) {
  Register(input: {email: $email, password: $password, username: $username}) {
    user {
      _id
      username
      email
      password
      createdAt
      updatedAt
    }
    accessToken
  }
}`;