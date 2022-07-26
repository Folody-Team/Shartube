import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Time: any;
  _Any: any;
  _FieldSet: any;
};

export type Comic = CreateComic & {
  __typename?: 'Comic';
  CreatedBy?: Maybe<User>;
  CreatedByID: Scalars['String'];
  _id: Scalars['ID'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  session?: Maybe<Array<ComicSession>>;
  sessionId?: Maybe<Array<Scalars['String']>>;
  updatedAt: Scalars['Time'];
};

export type ComicChap = CreateComic & {
  __typename?: 'ComicChap';
  CreatedBy?: Maybe<User>;
  CreatedByID: Scalars['String'];
  Session: ComicSession;
  SessionId: Scalars['String'];
  _id: Scalars['ID'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  updatedAt: Scalars['Time'];
};

export type ComicSession = CreateComic & {
  __typename?: 'ComicSession';
  ChapIds?: Maybe<Array<Scalars['String']>>;
  Chaps?: Maybe<Array<ComicChap>>;
  Comic: Comic;
  ComicId: Scalars['String'];
  CreatedBy?: Maybe<User>;
  CreatedByID: Scalars['String'];
  _id: Scalars['ID'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  updatedAt: Scalars['Time'];
};

export type CreateComic = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicChap = {
  SessionID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicChapInput = {
  SessionID: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicChapInputModel = CreateComicChap & {
  __typename?: 'CreateComicChapInputModel';
  CreatedByID: Scalars['String'];
  SessionID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicInputModel = CreateComic & {
  __typename?: 'CreateComicInputModel';
  CreatedByID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicSession = {
  comicID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicSessionInput = {
  comicID: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateComicSessionInputModel = CreateComicSession & {
  __typename?: 'CreateComicSessionInputModel';
  CreatedByID: Scalars['String'];
  comicID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type LoginUserInput = {
  UsernameOrEmail: Scalars['String'];
  password: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  CreateComicChap: ComicChap;
  CreateComicSession: ComicSession;
  Login: UserLoginOrRegisterResponse;
  Register: UserLoginOrRegisterResponse;
  createComic: Comic;
};


export type MutationCreateComicChapArgs = {
  input?: InputMaybe<CreateComicChapInput>;
};


export type MutationCreateComicSessionArgs = {
  input?: InputMaybe<CreateComicSessionInput>;
};


export type MutationLoginArgs = {
  input: LoginUserInput;
};


export type MutationRegisterArgs = {
  input: RegisterUserInput;
};


export type MutationCreateComicArgs = {
  input?: InputMaybe<CreateComicInput>;
};

export type Query = {
  __typename?: 'Query';
  ChapBySession?: Maybe<Array<ComicChap>>;
  Comics?: Maybe<Array<Comic>>;
  Me: User;
  SessionByComic?: Maybe<Array<ComicSession>>;
  _service: _Service;
};


export type QueryChapBySessionArgs = {
  SessionID: Scalars['String'];
};


export type QuerySessionByComicArgs = {
  comicID: Scalars['String'];
};

export type RegisterUserInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID'];
  comicIDs?: Maybe<Array<Scalars['String']>>;
  comics?: Maybe<Array<Comic>>;
  createdAt: Scalars['Time'];
  email: Scalars['String'];
  password?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Time'];
  username: Scalars['String'];
};

export type UserLoginOrRegisterResponse = {
  __typename?: 'UserLoginOrRegisterResponse';
  accessToken: Scalars['String'];
  user: User;
};

export type UserModelInput = {
  __typename?: 'UserModelInput';
  _id: Scalars['ID'];
  comicIDs?: Maybe<Array<Scalars['String']>>;
  createdAt: Scalars['Time'];
  email: Scalars['String'];
  password?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Time'];
  username: Scalars['String'];
};

export type _Service = {
  __typename?: '_Service';
  sdl?: Maybe<Scalars['String']>;
};

export type UserInfoFragment = { __typename?: 'User', _id: string, username: string, email: string, password?: string | null, createdAt: any, updatedAt: any };

export type RegisterMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', Register: { __typename?: 'UserLoginOrRegisterResponse', accessToken: string, user: { __typename?: 'User', _id: string, username: string, email: string, password?: string | null, createdAt: any, updatedAt: any } } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', Me: { __typename?: 'User', _id: string, username: string, email: string, password?: string | null, createdAt: any, updatedAt: any } };

export const UserInfoFragmentDoc = gql`
    fragment userInfo on User {
  _id
  username
  email
  password
  createdAt
  updatedAt
}
    `;
export const RegisterDocument = gql`
    mutation Register($input: RegisterUserInput!) {
  Register(input: $input) {
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
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const MeDocument = gql`
    query Me {
  Me {
    ...userInfo
  }
}
    ${UserInfoFragmentDoc}`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;