const PLATFORM_FEE_RATE = 0.05 // 5%

export function calculatePlatformFee(servicePrice: number): number {
  return Math.round(servicePrice * PLATFORM_FEE_RATE)
}

export function calculateTotal(servicePrice: number): number {
  return servicePrice + calculatePlatformFee(servicePrice)
}

export function getPlatformFeeRate(): number {
  return PLATFORM_FEE_RATE
}

export function getPlatformFeePercent(): string {
  return `${PLATFORM_FEE_RATE * 100}%`
}

export function getBreakdown(servicePrice: number) {
  const platformFee = calculatePlatformFee(servicePrice)
  return {
    servicePrice,
    platformFee,
    platformFeeRate: PLATFORM_FEE_RATE,
    total: servicePrice + platformFee,
  }
}
