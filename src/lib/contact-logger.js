// Simple contact logging service for KL Varme
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
      // Check if session already exists
      const { data: existingData, error: checkError } = await supabase
        .from('klvarme_contacts')
        .select('id')
        .eq('session_id', contactData.sessionId)
        .single();

      let data, error;

      if (existingData && !checkError) {
        // Update existing record
        console.log(`🔄 Oppdaterer eksisterende session: ${contactData.sessionId}`);
        const result = await supabase
          .from('klvarme_contacts')
          .update({
            customer_name: contactData.customerName,
            customer_email: contactData.customerEmail,
            conversation_history: contactData.conversationHistory,
            trigger_message: contactData.triggerMessage,
            current_url: contactData.currentUrl,
            user_ip: contactData.userIp,
            user_agent: contactData.userAgent,
            session_duration: contactData.sessionDuration || null,
            end_reason: contactData.endReason || 'contact_collected'
          })
          .eq('session_id', contactData.sessionId)
          .select();
        
        data = result.data;
        error = result.error;
      } else {
        // Insert new record
        console.log(`➕ Oppretter ny session: ${contactData.sessionId}`);
        const result = await supabase
          .from('klvarme_contacts')
          .insert([{
            session_id: contactData.sessionId,
            customer_name: contactData.customerName,
            customer_email: contactData.customerEmail,
            conversation_history: contactData.conversationHistory,
            trigger_message: contactData.triggerMessage,
            current_url: contactData.currentUrl,
            user_ip: contactData.userIp,
            user_agent: contactData.userAgent,
            session_duration: contactData.sessionDuration || null,
            end_reason: contactData.endReason || 'contact_collected'
          }])
          .select();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('❌ Feil ved lagring til Supabase:', error);
        // Fallback til console logging
        console.log('📧 KONTAKT MOTTATT (Supabase feilet):');
        console.log(`👤 Navn: ${contactData.customerName}`);
        console.log(`📧 E-post: ${contactData.customerEmail}`);
        return { success: false, error: error.message, fallback: 'console' };
      }

      console.log(`✅ Kontakt lagret i database: ${contactData.customerName} (${contactData.customerEmail})`);
      return { success: true, method: 'supabase', data };

    } catch (err) {
      console.error('❌ Database-feil:', err);
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
