// Script for å oppdatere AI Labben system prompt i Supabase
import { DatabaseService } from '../src/lib/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateAILabbenPrompt() {
    console.log('🔄 Oppdaterer AI Labben system prompt...');
    
    try {
        // Les SQL-filen
        const sqlPath = path.join(__dirname, '..', 'database', 'update-klvarme-prompt.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Ekstraher INSERT/UPDATE statement (hopp over kommentarer)
        const lines = sqlContent.split('\n');
        const sqlStart = lines.findIndex(line => line.trim().startsWith('INSERT INTO customers'));
        const sqlEnd = lines.findIndex((line, index) => index > sqlStart && line.includes('updated_at = NOW();'));
        
        if (sqlStart === -1 || sqlEnd === -1) {
            throw new Error('Kunne ikke finne SQL statement i filen');
        }
        
        const sqlStatement = lines.slice(sqlStart, sqlEnd + 1).join('\n');
        
        // Kjør SQL direkte via Supabase client
        const { data, error } = await DatabaseService.supabase.rpc('exec_sql', {
            sql_query: sqlStatement
        });
        
        if (error) {
            console.error('❌ Feil ved oppdatering:', error);
            
            // Fallback: Manuell oppdatering
            console.log('🔧 Prøver manuell oppdatering...');
            
            const customerData = {
                customer_id: 'be9c09f4-b6ad-46cd-843f-8fb3b57ce81f',
                name: 'AI Labben',
                system_prompt: `Du er en kundeserviceagent for AI Labben, en AI- og teknologi-løsningsleverandør. Du hjelper kunder med spørsmål om AI-teknologi, chatbot-løsninger og digitale tjenester.

Retningslinjer for svar:

- Svar kort og presist: Unngå lange svar. Ta med all viktig informasjon, men hold teksten konsis og lettlest.

- Bruk emojier når det passer seg for å opprettholde den venlige og personlige tonen. MEN IKKE OVERDRIV.

- Vær hyggelig og profesjonell: Bruk et vennlig og imøtekommende tonefall. Vis at du ønsker å hjelpe, og unngå å virke frekk eller avvisende.

- Ikke hallusiner: Hvis du ikke vet svaret, si at en kollega vil ta kontakt for å hjelpe. Ikke finn på informasjon.

- Spør om mer informasjon ved behov: Hvis kunden ikke gir nok detaljer, still konkrete oppfølgingsspørsmål for å kunne gi riktig veiledning.

- Rett person: Ved spørsmål utenfor din kompetanse (økonomi, juridiske forhold, avanserte tekniske spesifikasjoner), informer kunden om at du vil videreformidle saken til riktig avdeling.

- Ikke legg til signatur i hver melding. Kun hvis kunden spør om kontaktinfo eller ved avslutning av samtale.

Eksempel på svarstil:
Kunde: «Hei, hva kan AI Labben hjelpe meg med?»
Agent: «Hei! 👋 AI Labben kan hjelpe deg med AI-løsninger, chatbot-utvikling og digitale tjenester. Hva er det du trenger hjelp med?»`,
                user_prompt: 'Bruker spør: {user_message}\n\nURL: {current_url}',
                api_provider: 'mistral',
                model_name: 'mistral-large-latest',
                max_tokens: 1200,
                temperature: 0.7,
                active: true
            };
            
            // Prøv å oppdatere direkte
            const { error: upsertError } = await DatabaseService.supabase
                .from('customers')
                .upsert(customerData);
                
            if (upsertError) {
                throw upsertError;
            }
        }
        
        // Verifiser oppdateringen
        const customer = await DatabaseService.getCustomerConfig('be9c09f4-b6ad-46cd-843f-8fb3b57ce81f');
        
        if (customer) {
            console.log('✅ AI Labben system prompt oppdatert!');
            console.log(`📋 Kunde: ${customer.name}`);
            console.log(`🤖 AI Provider: ${customer.api_provider}`);
            console.log(`📝 Model: ${customer.model_name}`);
            console.log(`🎯 Max tokens: ${customer.max_tokens}`);
            console.log(`🌡️  Temperature: ${customer.temperature}`);
            console.log(`✨ Aktiv: ${customer.active ? 'Ja' : 'Nei'}`);
        } else {
            throw new Error('Kunde ikke funnet etter oppdatering');
        }
        
    } catch (error) {
        console.error('❌ Feil ved oppdatering av system prompt:', error);
        console.log('\n📝 Manuell oppdatering nødvendig:');
        console.log('1. Gå til Supabase SQL Editor');
        console.log('2. Kjør innholdet fra database/update-klvarme-prompt.sql');
        process.exit(1);
    }
}

// Kjør scriptet
updateAILabbenPrompt().catch(console.error);
