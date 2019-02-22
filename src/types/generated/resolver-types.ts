export type Maybe<T> = T | null

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

/** The `Upload` scalar type represents a file upload. */
export type Upload = any
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql'

export type Resolver<Result, Parent = {}, TContext = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result

export interface ISubscriptionResolverObject<Result, Parent, TContext, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>
}

export type SubscriptionResolver<Result, Parent = {}, TContext = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, TContext, Args>)
  | ISubscriptionResolverObject<Result, Parent, TContext, Args>

export type TypeResolveFn<Types, Parent = {}, TContext = {}> = (
  parent: Parent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<Types>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

export namespace QueryResolvers {
  export interface Resolvers<TContext = {}, TypeParent = {}> {
    books?: BooksResolver<Maybe<(Maybe<Book>)[]>, TypeParent, TContext>
  }

  export type BooksResolver<
    R = Maybe<(Maybe<Book>)[]>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace BookResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Book> {
    title?: TitleResolver<Maybe<string>, TypeParent, TContext>

    author?: AuthorResolver<Maybe<string>, TypeParent, TContext>
  }

  export type TitleResolver<R = Maybe<string>, Parent = Book, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type AuthorResolver<R = Maybe<string>, Parent = Book, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export type CacheControlDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  CacheControlDirectiveArgs,
  {}
>
export interface CacheControlDirectiveArgs {
  maxAge?: Maybe<number>

  scope?: Maybe<CacheControlScope>
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  {}
>
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  {}
>
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  {}
>
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string
}

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<Upload, any> {
  name: 'Upload'
}

export interface IResolvers<TContext = {}> {
  Query?: QueryResolvers.Resolvers<TContext>
  Book?: BookResolvers.Resolvers<TContext>
  Upload?: GraphQLScalarType
}

export interface IDirectiveResolvers<Result> {
  cacheControl?: CacheControlDirectiveResolver<Result>
  skip?: SkipDirectiveResolver<Result>
  include?: IncludeDirectiveResolver<Result>
  deprecated?: DeprecatedDirectiveResolver<Result>
}
