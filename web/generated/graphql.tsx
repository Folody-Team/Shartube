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
  Upload: any;
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
  thumbnail?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Time'];
};

export type ComicChap = CreateComicChap & {
  __typename?: 'ComicChap';
  CreatedBy?: Maybe<User>;
  CreatedByID: Scalars['String'];
  Images: Array<ImageResult>;
  Session: ComicSession;
  SessionID: Scalars['String'];
  _id: Scalars['ID'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  updatedAt: Scalars['Time'];
};

export type ComicSession = CreateComicSession & {
  __typename?: 'ComicSession';
  ChapIds?: Maybe<Array<Scalars['String']>>;
  Chaps?: Maybe<Array<ComicChap>>;
  Comic: Comic;
  CreatedBy?: Maybe<User>;
  CreatedByID: Scalars['String'];
  _id: Scalars['ID'];
  comicID: Scalars['String'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Time'];
};

export type CreateComic = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
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
  thumbnail?: InputMaybe<Scalars['Upload']>;
};

export type CreateComicInputModel = CreateComic & {
  __typename?: 'CreateComicInputModel';
  CreatedByID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
};

export type CreateComicSession = {
  comicID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
};

export type CreateComicSessionInput = {
  comicID: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: InputMaybe<Scalars['Upload']>;
};

export type CreateComicSessionInputModel = CreateComicSession & {
  __typename?: 'CreateComicSessionInputModel';
  CreatedByID: Scalars['String'];
  comicID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
};

export type DeleteResult = {
  __typename?: 'DeleteResult';
  id: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ImageResult = {
  __typename?: 'ImageResult';
  ID: Scalars['String'];
  Url: Scalars['String'];
};

export type LoginUserInput = {
  UsernameOrEmail: Scalars['String'];
  password: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  AddImageToChap: ComicChap;
  CreateComicChap: ComicChap;
  CreateComicSession: ComicSession;
  DeleteChapImage: ComicChap;
  DeleteComic: DeleteResult;
  DeleteComicChap: DeleteResult;
  DeleteComicSession: DeleteResult;
  Login: UserLoginOrRegisterResponse;
  Register: UserLoginOrRegisterResponse;
  _empty?: Maybe<Scalars['String']>;
  createComic: Comic;
  updateComic: Comic;
  updateComicChap: ComicChap;
  updateComicSession: ComicSession;
};


export type MutationAddImageToChapArgs = {
  chapID: Scalars['String'];
  req: Array<UploadFile>;
};


export type MutationCreateComicChapArgs = {
  input: CreateComicChapInput;
};


export type MutationCreateComicSessionArgs = {
  input: CreateComicSessionInput;
};


export type MutationDeleteChapImageArgs = {
  chapID: Scalars['String'];
  imageID: Array<Scalars['String']>;
};


export type MutationDeleteComicArgs = {
  comicID: Scalars['String'];
};


export type MutationDeleteComicChapArgs = {
  chapID: Scalars['String'];
};


export type MutationDeleteComicSessionArgs = {
  sessionID: Scalars['String'];
};


export type MutationLoginArgs = {
  input: LoginUserInput;
};


export type MutationRegisterArgs = {
  input: RegisterUserInput;
};


export type MutationCreateComicArgs = {
  input: CreateComicInput;
};


export type MutationUpdateComicArgs = {
  comicID: Scalars['String'];
  input: UpdateComicInput;
};


export type MutationUpdateComicChapArgs = {
  chapID: Scalars['String'];
  input: UpdateComicChapInput;
};


export type MutationUpdateComicSessionArgs = {
  input?: InputMaybe<UpdateComicSessionInput>;
  sessionID: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  ChapBySession?: Maybe<Array<ComicChap>>;
  Comics: Array<Comic>;
  Me: User;
  SessionByComic?: Maybe<Array<ComicSession>>;
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

export type UpdateComicChapInput = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateComicInput = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateComicSessionInput = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UploadFile = {
  file: Scalars['Upload'];
  id: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID'];
  comicIDs?: Maybe<Array<Maybe<Scalars['String']>>>;
  comics?: Maybe<Array<Maybe<Comic>>>;
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

export type UserInfoFragment = { __typename?: 'User', _id: string, username: string, email: string, password?: string | null, createdAt: any, updatedAt: any };

export type LoginMutationVariables = Exact<{
  input: LoginUserInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', Login: { __typename?: 'UserLoginOrRegisterResponse', accessToken: string, user: { __typename?: 'User', _id: string, username: string, email: string, password?: string | null, createdAt: any, updatedAt: any } } };

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
export const LoginDocument = gql`
    mutation Login($input: LoginUserInput!) {
  Login(input: $input) {
    user {
      ...userInfo
    }
    accessToken
  }
}
    ${UserInfoFragmentDoc}`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($input: RegisterUserInput!) {
  Register(input: $input) {
    user {
      ...userInfo
    }
    accessToken
  }
}
    ${UserInfoFragmentDoc}`;
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