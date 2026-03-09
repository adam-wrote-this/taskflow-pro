import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['zh', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'zh'

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from request first
  let locale = await requestLocale
  
  // If no locale from request, try cookie
  if (!locale) {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value
    if (localeCookie && locales.includes(localeCookie as Locale)) {
      locale = localeCookie
    }
  }
  
  // Validate locale and fallback to default
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
