import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { locales, defaultLocale, type Locale } from './config'

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
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
