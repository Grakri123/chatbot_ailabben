// Customer-specific configuration
// Dette er den ENESTE filen du endrer når du kloner repoet for en ny kunde

export const CUSTOMER_CONFIG = {
  // HOVEDKONFIGURASJON - Endre kun denne når du kloner repoet
  CUSTOMER_ID: "be9c09f4-b6ad-46cd-843f-8fb3b57ce81f",  // ← LEGG INN CUSTOMER_ID HER (må matche Supabase)
  CUSTOMER_NAME: "KL VARME",  // ← LEGG INN KUNDENAVN HER
  
  // Widget-konfigurasjon (kan tilpasses per kunde)
  WIDGET: {
    name: "KL VARME",  // Vil bruke CUSTOMER_NAME hvis satt
    subtitle: "Vi hjelper deg gjerne!",
    avatar: "KL",
    primaryColor: "#429D0A",
    welcomeMessage: {
      title: "Velkommen til KL VARME!",
      text: "Jeg er her for å hjelpe deg med dine spørsmål om varmepumper og energiløsninger."
    }
  },
  
  // API-konfigurasjon
  API: {
    maxMessageLength: 2000,
    rateLimitPerMinute: 20,
    typingDelay: 1000,
    retryAttempts: 3
  },
  
  // Proaktiv chat-konfigurasjon
  PROACTIVE_CHAT: {
    enabled: true,
    delay: 5000, // 5 sekunder
    message: "Hei jeg er KL VARME sin KI hjelper, og jeg kan svare å hjelpe deg med alle spørsmål du har om varmepumper og installasjon",
    showOnce: true // Kun én gang per browser-session
  }
};

// Validering
if (!CUSTOMER_CONFIG.CUSTOMER_ID) {
  console.warn('⚠️  CUSTOMER_ID er ikke satt i customer.js - legg inn customer_id som matcher Supabase');
}

if (!CUSTOMER_CONFIG.CUSTOMER_NAME) {
  console.warn('⚠️  CUSTOMER_NAME er ikke satt i customer.js - legg inn kundenavn');
}

if (CUSTOMER_CONFIG.CUSTOMER_ID && !/^[a-zA-Z0-9_-]+$/.test(CUSTOMER_CONFIG.CUSTOMER_ID)) {
  // UUID format er OK (inneholder bindestreker)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(CUSTOMER_CONFIG.CUSTOMER_ID)) {
    throw new Error('CUSTOMER_ID må være enten alfanumerisk (a-z, 0-9, _, -) eller gyldig UUID format');
  }
}
