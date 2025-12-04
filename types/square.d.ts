declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string,
      ) => {
        ach: () => Promise<{
          attach: (selector: string) => Promise<void>
          tokenize: () => Promise<{
            status: string
            token?: string
            errors?: Array<{ message: string }>
          }>
        }>
        giftCard: () => Promise<{
          attach: (selector: string) => Promise<void>
          tokenize: () => Promise<{
            status: string
            token?: string
            errors?: Array<{ message: string }>
          }>
        }>
      }
    }
  }
}

export {}
