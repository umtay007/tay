declare global {
  interface Window {
    Square: {
      payments: (
        applicationId: string,
        locationId: string,
      ) => {
        paymentRequest: (options: {
          countryCode: string
          currencyCode: string
          total: {
            amount: string
            label: string
          }
        }) => any
        applePay: (paymentRequest: any) => Promise<{
          tokenize: () => Promise<{
            status: string
            token?: string
          }>
        }>
      }
    }
  }
}

export {}
