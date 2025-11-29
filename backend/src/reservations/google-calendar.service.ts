import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as path from 'path';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private configService: ConfigService) {}

  // Pega o ID da variável de ambiente
  private get CALENDAR_ID(): string {
    const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
    
    // Fallback de segurança se não tiver no .env
    if (!calendarId) {
       // DICA: Substitua pelo seu email se ainda não configurou o .env
       // return 'seu.email@gmail.com'; 
       throw new Error('A variável de ambiente GOOGLE_CALENDAR_ID não foi definida!');
    }
    return calendarId;
  }

  async getEventsFromCalendar() {
    this.logger.log(`Conectando ao Google Calendar ID: ${this.CALENDAR_ID}...`);

    try {
      // Autenticação
      const auth = new google.auth.GoogleAuth({
        keyFile: path.join(process.cwd(), 'google-credentials.json'), 
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      // Intervalo de tempo (Próximos 7 dias)
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const response = await calendar.events.list({
        calendarId: this.CALENDAR_ID,
        timeMin: now.toISOString(),
        timeMax: nextWeek.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items;
      if (!events || events.length === 0) {
        this.logger.warn('Nenhum evento encontrado.');
        return [];
      }

      const mappedEvents = events
        .map((event) => {
          // --- CORREÇÃO 1: Verificação Defensiva ---
          // Se o evento não tiver objeto de início ou fim, retornamos null
          if (!event.start || !event.end) {
            return null;
          }

          // --- CORREÇÃO 2: Extração Segura ---
          // O Google pode mandar 'dateTime' (evento com hora) ou 'date' (dia inteiro)
          const startString = event.start.dateTime || event.start.date;
          const endString = event.end.dateTime || event.end.date;

          // Se mesmo assim as strings estiverem vazias, ignoramos
          if (!startString || !endString) {
            return null;
          }

          const dateObj = new Date(startString);
          
          const timeString = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const dateString = dateObj.toISOString().split('T')[0];

          return {
            subject: event.summary || 'Sem Título',
            lab: event.location || 'Sem Local',
            professor: event.description || 'Desconhecido',
            
            startTimeISO: startString,
            endTimeISO: endString,
            
            detectedStartTime: timeString, 
            detectedSlot: 'Google', 
            selectedDate: dateString, 
          };
        })
        // --- CORREÇÃO 3: Filtragem ---
        // Removemos os itens nulos da lista final
        .filter((event): event is NonNullable<typeof event> => event !== null);

      return mappedEvents;

    } catch (error: any) {
      this.logger.error('Erro ao buscar agenda do Google', error);
      throw new Error(`Falha Google Calendar: ${error.message}`);
    }
  }
}