class InvalidEitherError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidEitherError'
  }
}

export type Left<T> = {
  left: T
  right?: never
}

export type Right<U> = {
  left?: never
  right: U
}

export type Either<T, U> = NonNullable<Left<T> | Right<U>>

export const isLeft = <T, U>(value: Either<T, U>): value is Left<T> => {
  return value.left !== undefined
}

export const isRight = <T, U>(value: Either<T, U>): value is Right<U> => {
  return value.right !== undefined
}

export type UnwrapEither = <T, U>(value: Either<T, U>) => NonNullable<T | U>

export const unwrapEither: UnwrapEither = <T, U>({
  left,
  right,
}: Either<T, U>) => {
  if (right !== undefined && left !== undefined) {
    throw new InvalidEitherError(
      `Received both left and right values at runtime when opening an Either\nLeft: ${JSON.stringify(left)}\nRight: ${JSON.stringify(right)}`,
    )
  }

  if (left !== undefined) {
    return left as NonNullable<T>
  }

  if (right !== undefined) {
    return right as NonNullable<U>
  }

  throw new InvalidEitherError(
    'Received no left or right values at runtime when opening Either',
  )
}

export const makeLeft = <T>(value: T): Left<T> => ({ left: value })

export const makeRight = <U>(value: U): Right<U> => ({ right: value })
