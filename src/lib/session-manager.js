// Session Manager for AI Labben Chatbot
// Håndterer aktive sessions med 2-minutt timeout
import { ContactLogger } from './contact-logger.js';

class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> sessionData
    this.SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutter
  }

  // Hent eller opprett session (uten å resette timer)
  getSession(sessionId) {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = {
        id: sessionId,
        chatHistory: [],
        contactCollected: false,
        contactInfo: null,
        startTime: Date.now(),
        lastActivity: Date.now(),
        timer: null,
        metadata: {},
        userMessageCount: 0 // Teller for ekte brukermeldinger (ekskluderer kontaktskjema-innsendinger)
      };
      this.sessions.set(sessionId, session);
      console.log(`🆕 Ny session opprettet: ${sessionId}`);
      // Start timer for ny session
      this.resetSessionTimer(sessionId);
    }
    
    return session;
  }

  // Oppdater aktivitet og reset timer
  updateActivity(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      this.resetSessionTimer(sessionId);
      console.log(`⏰ Timer reset for session ${sessionId}`);
    }
  }

  // Legg til melding i session
  addMessage(sessionId, role, content) {
    const session = this.getSession(sessionId);
    session.chatHistory.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    // Reset timer kun for brukermeldinger
    if (role === 'user') {
      this.updateActivity(sessionId);
      
      // Øk teller for brukermeldinger (kun hvis det ikke er kontaktskjema-innsending)
      const isFormSubmission = content.includes('user_name') || content.includes('user_email') ||
        (content.includes('Navn:') && content.includes('E-post:'));
      
      if (!isFormSubmission) {
        session.userMessageCount = (session.userMessageCount || 0) + 1;
        console.log(`📊 Brukermelding teller: ${session.userMessageCount}`);
      } else {
        console.log(`📊 Kontaktskjema-innsending ekskludert fra telling`);
      }
    }
    
    console.log(`💬 Melding lagt til session ${sessionId}: ${role} - ${content.substring(0, 50)}...`);
  }
  
  // Hent antall ekte brukermeldinger (ekskluderer kontaktskjema-innsendinger)
  getUserMessageCount(sessionId) {
    const session = this.getSession(sessionId);
    return session.userMessageCount || 0;
  }

  // Marker kontakt som samlet
  setContactCollected(sessionId, contactInfo) {
    const session = this.getSession(sessionId);
    session.contactCollected = true;
    session.contactInfo = contactInfo;
    session.savedToDatabase = true; // Marker som lagret
    
    console.log(`📧 Kontakt samlet for session ${sessionId}: ${contactInfo.userName}`);
  }

  // Sjekk om kontakt allerede er samlet
  hasContactInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.contactCollected : false;
  }

  // Hent kontaktinfo
  getContactInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.contactInfo : null;
  }

  // Reset session timer
  resetSessionTimer(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Clear existing timer
    if (session.timer) {
      clearTimeout(session.timer);
    }

    // Set new timer
    session.timer = setTimeout(() => {
      this.endSession(sessionId, 'timeout');
    }, this.SESSION_TIMEOUT);
  }

  // Avslutt session og send til database
  async endSession(sessionId, reason = 'manual') {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`🔚 Avslutter session ${sessionId} (${reason})`);

    // Clear timer
    if (session.timer) {
      clearTimeout(session.timer);
    }

    // Send til database hvis kontakt er samlet
    if (session.contactCollected && session.contactInfo) {
      try {
        // Finn trigger-meldingen (siste brukermelding før kontaktskjema)
        let triggerMessage = 'Ukjent';
        for (let i = session.chatHistory.length - 1; i >= 0; i--) {
          const msg = session.chatHistory[i];
          if (msg.role === 'user' && 
              !msg.content.includes('user_name') && 
              !msg.content.includes('user_email')) {
            triggerMessage = msg.content;
            break;
          }
        }

        await ContactLogger.logContact({
          sessionId: session.id,
          customerName: session.contactInfo.userName,
          customerEmail: session.contactInfo.userEmail,
          conversationHistory: session.chatHistory,
          triggerMessage: triggerMessage,
          currentUrl: session.metadata.currentUrl || 'Unknown',
          userIp: session.metadata.userIp || 'Unknown',
          userAgent: session.metadata.userAgent || 'Unknown',
          sessionDuration: Date.now() - session.startTime,
          endReason: reason
        });

        console.log(`✅ Session ${sessionId} lagret i database`);
      } catch (error) {
        console.error(`❌ Feil ved lagring av session ${sessionId}:`, error);
      }
    } else {
      console.log(`ℹ️  Session ${sessionId} avsluttet uten kontaktinfo`);
    }

    // Fjern session
    this.sessions.delete(sessionId);
  }

  // Sett metadata for session
  setMetadata(sessionId, metadata) {
    const session = this.getSession(sessionId);
    session.metadata = { ...session.metadata, ...metadata };
  }

  // Lagre første brukermelding (før kontaktinfo er samlet)
  setFirstUserMessage(sessionId, message) {
    const session = this.getSession(sessionId);
    if (!session.metadata.firstUserMessage) {
      session.metadata.firstUserMessage = message;
      console.log(`💾 Lagret første brukermelding for session ${sessionId}: ${message.substring(0, 50)}...`);
    }
  }

  // Hent første brukermelding
  getFirstUserMessage(sessionId) {
    const session = this.sessions.get(sessionId);
    return session?.metadata?.firstUserMessage || null;
  }

  // Hent alle aktive sessions (for debugging)
  getActiveSessions() {
    return Array.from(this.sessions.keys());
  }

  // Cleanup gamle sessions (kjøres periodisk)
  cleanup() {
    const now = Date.now();
    const toDelete = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        toDelete.push(sessionId);
      }
    }

    toDelete.forEach(sessionId => {
      this.endSession(sessionId, 'cleanup');
    });

    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} inactive sessions`);
    }
  }
}

// Global session manager instance
export const sessionManager = new SessionManager();

// Cleanup hver 5. minutt
setInterval(() => {
  sessionManager.cleanup();
}, 5 * 60 * 1000);
