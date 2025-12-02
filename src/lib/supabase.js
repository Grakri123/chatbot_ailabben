import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export class DatabaseService {
  
  // Get customer configuration by customer_id
  static async getCustomerConfig(customerId) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerId)
        .eq('active', true)
        .single();
      
      if (error) {
        console.error('Error fetching customer config:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Database error:', err);
      return null;
    }
  }





  // Get existing chat session
  static async getSession(customerId, sessionId) {
    try {
      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('customer_id', customerId)
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching session:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Database error:', err);
      return null;
    }
  }

  // Log chat interaction (session-based - accumulate messages)
  static async logChat(customerId, sessionId, userMessage, botResponse, metadata = {}) {
    try {
      // First, check if session already exists
      const { data: existingSession, error: selectError } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('customer_id', customerId)
        .eq('session_id', sessionId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking existing session:', selectError);
        return;
      }

      if (existingSession) {
        // Update existing session - append new messages
        const updatedUserMessage = existingSession.user_message + '\n---\n' + userMessage;
        const updatedBotResponse = existingSession.bot_response + '\n---\n' + botResponse;
        
        const updateData = {
          user_message: updatedUserMessage,
          bot_response: updatedBotResponse,
          message_count: existingSession.message_count + 1,
          total_response_time_ms: (existingSession.total_response_time_ms || 0) + (metadata.responseTime || 0),
          total_tokens_used: (existingSession.total_tokens_used || 0) + (metadata.tokensUsed || 0)
        };

        // Update contact info if provided
        if (metadata.userName) updateData.user_name = metadata.userName;
        if (metadata.userEmail) updateData.user_email = metadata.userEmail;
        if (metadata.contactCollected !== undefined) updateData.contact_collected = metadata.contactCollected;

        const { error: updateError } = await supabase
          .from('chat_logs')
          .update(updateData)
          .eq('customer_id', customerId)
          .eq('session_id', sessionId);

        if (updateError) {
          console.error('Error updating chat session:', updateError);
        }
      } else {
        // Create new session
        const { error: insertError } = await supabase
          .from('chat_logs')
          .insert([{
            customer_id: customerId,
            session_id: sessionId,
            user_message: userMessage,
            bot_response: botResponse,
            message_count: 1,
            user_name: metadata.userName || null,
            user_email: metadata.userEmail || null,
            contact_collected: metadata.contactCollected || false,
            current_url: metadata.currentUrl || null,
            user_ip: metadata.userIp || null,
            user_agent: metadata.userAgent || null,
            total_response_time_ms: metadata.responseTime || 0,
            total_tokens_used: metadata.tokensUsed || 0
          }]);

        if (insertError) {
          console.error('Error creating new chat session:', insertError);
        }
      }
    } catch (err) {
      console.error('Database error:', err);
    }
  }

  // Get vector chunks (for future embedding search)
  static async getVectorChunks(customerId, embedding = null, limit = 5) {
    try {
      let query = supabase
        .from('vector_chunks')
        .select('content, source_title, source_url')
        .eq('customer_id', customerId)
        .eq('active', true)
        .limit(limit);

      // If embedding provided, do similarity search
      if (embedding && Array.isArray(embedding)) {
        // This would require pgvector extension and proper similarity search
        // For now, just return random chunks
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching vector chunks:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Database error:', err);
      return [];
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (err) {
      console.error('Health check failed:', err);
      return false;
    }
  }
}
