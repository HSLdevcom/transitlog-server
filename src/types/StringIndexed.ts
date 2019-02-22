// https://github.com/dotansimha/graphql-code-generator/issues/1133#issuecomment-456812621

interface StringIndexSignatureInterface {
  [index: string]: any
}

export type StringIndexed<T> = T & StringIndexSignatureInterface
