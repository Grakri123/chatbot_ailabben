// Simple contact logging service for AI Labben
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

// Initialize Supabase only if credentials are available
console.log(`🔍 Supabase URL: ${supabaseUrl ? 'SET' : 'NOT SET'}`);
console.log(`🔍 Supabase Service Key: ${supabaseServiceKey ? 'SET' : 'NOT SET'}`);

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase client opprettet');
} else {
  console.log('❌ Supabase ikke konfigurert - mangler URL eller Service Key');
}

export class ContactLogger {
  
  static async logContact(contactData) {
    // If no Supabase configured, just log to console
    if (!supabase) {
      console.log('📧 KONTAKT MOTTATT (Supabase ikke konfigurert):');
      console.log(`👤 Navn: ${contactData.customerName}`);
      console.log(`📧 E-post: ${contactData.customerEmail}`);
      console.log(`💬 Trigger: ${contactData.triggerMessage}`);
      console.log(`🗨️  Samtale: ${JSON.stringify(contactData.conversationHistory, null, 2)}`);
      return { success: true, method: 'console' };
    }

    try {
      // Format conversation history as readable text
      let samtaleText = '';
      if (contactData.conversationHistory && Array.isArray(contactData.conversationHistory)) {
        samtaleText = contactData.conversationHistory.map(msg => {
          const role = msg.role === 'user' ? 'Bruker' : 'AI';
          let content = msg.content;
          
          // Skip contact form messages
          if (typeof content === 'string' && (content.includes('user_name') || content.includes('user_email'))) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.user_name || parsed.user_email) {
                return null; // Skip form submissions
              }
            } catch {
              // Not JSON, might be text format
              if (content.includes('Navn:') && content.includes('E-post:')) {
                return null; // Skip form submissions
              }
            }
          }
          
          // Skip contact form assistant messages
          if (msg.role === 'assistant' && typeof content === 'string') {
            try {
              const parsed = JSON.parse(content);
              if (parsed && parsed.type === 'contact_form') {
                return null; // Skip contact form messages
              }
            } catch {
              // Not JSON, continue
            }
          }
          
          // Format content
          if (typeof content === 'object') {
            content = JSON.stringify(content, null, 2);
          }
          
          return `${role}: ${content}`;
        })
        .filter(msg => msg !== null) // Remove skipped messages
        .join('\n\n');
      } else {
        samtaleText = JSON.stringify(contactData.conversationHistory, null, 2);
      }

      // Insert new record (no update check since we don't have session_id in new schema)
      console.log(`➕ Lagrer lead til chatbot_leads: ${contactData.customerName}`);
      console.log(`📧 E-post: ${contactData.customerEmail}`);
      console.log(`📝 Samtale lengde: ${samtaleText.length} tegn`);
      
      const insertData = {
        navn: contactData.customerName || null,
        epost: contactData.customerEmail || null,
        bedrift: contactData.bedrift || null, // Optional field
        samtale: samtaleText || 'Ingen samtale registrert'
      };
      
      console.log(`📦 Data som sendes:`, JSON.stringify(insertData, null, 2).substring(0, 500) + '...');
      
      const result = await supabase
        .from('chatbot_leads')
        .insert([insertData])
        .select();
      
      if (result.error) {
        console.error('❌ Feil ved lagring til Supabase:', result.error);
        console.error('❌ Feil kode:', result.error.code);
        console.error('❌ Feil melding:', result.error.message);
        console.error('❌ Feil detaljer:', JSON.stringify(result.error, null, 2));
        console.error('❌ Full error object:', result.error);
        // Fallback til console logging
        console.log('📧 KONTAKT MOTTATT (Supabase feilet):');
        console.log(`👤 Navn: ${contactData.customerName}`);
        console.log(`📧 E-post: ${contactData.customerEmail}`);
        return { success: false, error: result.error.message, fallback: 'console' };
      }

      console.log(`✅ Lead lagret i database: ${contactData.customerName} (${contactData.customerEmail})`);
      console.log(`📝 Samtale lagret (${samtaleText.length} tegn)`);
      console.log(`🆔 Lagret med ID: ${result.data?.[0]?.id || 'ukjent'}`);
      return { success: true, method: 'supabase', data: result.data };

    } catch (err) {
      console.error('❌ Database-feil:', err);
      console.error('❌ Feil stack:', err.stack);
      // Fallback til console logging
      console.log('📧 KONTAKT MOTTATT (Database-feil):');
      console.log(`👤 Navn: ${contactData.customerName}`);
      console.log(`📧 E-post: ${contactData.customerEmail}`);
      return { success: false, error: err.message, fallback: 'console' };
    }
  }

  static isConfigured() {
    return !!supabase;
  }
}
