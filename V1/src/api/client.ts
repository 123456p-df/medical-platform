export const delay = <T>(data: T, ms = 320): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(data), ms)
  })
