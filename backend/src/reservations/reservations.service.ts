import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GoogleCalendarService } from './google-calendar.service';

// Carrega a biblioteca pdf-extraction
const pdf = require('pdf-extraction');

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);
  private readonly TIME_SLOTS: Record<string, string> = {
    '1': '07:30', '2': '08:20', '3': '09:10', '4': '10:10',
    '5': '11:00', '5,5': '11:50', '6': '13:00', '7': '13:50',
    '8': '14:40', '9': '15:50', '10': '16:40', '11': '19:00',
    '12': '19:50', '13': '20:40', '14': '21:30',
  };

  constructor(
    private prisma: PrismaService,
    private googleService: GoogleCalendarService
  ) {}

  async create(dto: CreateReservationDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('A data de fim deve ser maior que a de início.');
    }

    const conflict = await this.prisma.reservation.findFirst({
      where: {
        labId: dto.labId,
        OR: [
          { startTime: { lte: start }, endTime: { gt: start } },
          { startTime: { lt: end }, endTime: { gte: end } },
        ],
      },
    });

    if (conflict) {
      throw new ConflictException('Já existe uma reserva para este laboratório neste horário.');
    }

    return this.prisma.reservation.create({
      data: {
        userId: dto.userId,
        labId: dto.labId,
        startTime: start,
        endTime: end,
      },
      include: {
        user: { select: { username: true, email: true } },
        lab: { select: { name: true } },
      }
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        user: { select: { username: true } },
        lab: { select: { name: true } },
      },
      orderBy: { startTime: 'desc' }
    });
  }

  async findByUser(userId: number) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { lab: true },
      orderBy: { startTime: 'desc' }
    });
  }

  async remove(id: number) {
    return this.prisma.reservation.delete({ where: { id } });
  }

  // --- LÓGICA DE PDF COM VERIFICAÇÃO ---
  async processSchedulePdf(file: Express.Multer.File) {
    this.logger.log(`Iniciando processamento do arquivo: ${file.originalname}`);

    try {
      const data = await pdf(file.buffer);
      let text = data.text;

      // Limpeza
      text = text.replace(/LAB\s*\.?\s*\n\s*(INFORMÁTICA|REDES|ROBÓTICA|DADOS)/gi, 'LAB. $1');
      text = text.replace(/(LAB\.[^\n]+)\n\s*(\d{2,}-?COINF[-\w]*)/gi, '$1 $2');
      text = text.replace(/(LAB\.[^\n]+)\n\s*(\d{2,}-?BL\d{2}[-\w]*)/gi, '$1 $2');
      text = text.replace(/^\s*-\s*$/gm, '');

      // CORREÇÃO: Tipagem do array como 'any[]' para evitar erro de 'never'
      const extractedClasses: any[] = [];
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      const userCache = new Map(); 
      const labCache = new Map();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.toUpperCase().includes('LAB.') || line.toUpperCase().includes('SALA ')) {
          
          let labName = line; 
          
          let timeSlot = '';
          let startTime = 'Manual';
          const nextLine = lines[i + 1];
          if (nextLine && /^(\d{1,2}(,\d)?)$/.test(nextLine)) {
             timeSlot = nextLine;
             startTime = this.TIME_SLOTS[timeSlot] || 'Manual';
          }

          let professorName = lines[i - 1] || 'Desconhecido';
          let subject = lines[i - 2] || 'Desconhecido';
          const preSubject = lines[i - 3];
          if (preSubject && !preSubject.includes('LAB') && !/^\d+$/.test(preSubject) && preSubject.length > 2) {
             subject = `${preSubject} ${subject}`;
          }

          if (labName.length > 4 && professorName.length > 2) {
            
            // CORREÇÃO: Tipagem explicita 'any' para aceitar o objeto do Prisma ou null
            let dbLab: any = null;
            if (labCache.has(labName)) {
                dbLab = labCache.get(labName);
            } else {
                dbLab = await this.prisma.lab.findFirst({
                    where: { 
                        name: { contains: labName.split(' ')[0] } 
                    } 
                });
                
                const codeMatch = labName.match(/\d{2}-COINF/);
                if (!dbLab && codeMatch) {
                    dbLab = await this.prisma.lab.findFirst({
                        where: { name: { contains: codeMatch[0] } }
                    });
                }
                labCache.set(labName, dbLab);
            }

            // CORREÇÃO: Tipagem explicita 'any' e remoção do mode: 'insensitive'
            let dbUser: any = null;
            if (userCache.has(professorName)) {
                dbUser = userCache.get(professorName);
            } else {
                dbUser = await this.prisma.user.findFirst({
                    where: { 
                        username: { 
                            contains: professorName.split(' ')[0], 
                            // Removido mode: 'insensitive' pois causava erro de tipo
                        } 
                    }
                });
                userCache.set(professorName, dbUser);
            }

            let status = 'PENDENTE';
            let statusMessage = '';

            if (dbUser && dbLab) {
                status = 'PRONTO';
                statusMessage = 'Usuário e Lab encontrados';
            } else if (!dbUser && !dbLab) {
                status = 'ERRO';
                statusMessage = 'Usuário e Lab não cadastrados';
            } else if (!dbUser) {
                status = 'ERRO_USER';
                statusMessage = `Professor '${professorName}' não encontrado`;
            } else {
                status = 'ERRO_LAB';
                statusMessage = `Lab '${labName}' não encontrado`;
            }

            extractedClasses.push({
              subject,
              professor: professorName,
              lab: labName,
              detectedSlot: timeSlot || '?',
              detectedStartTime: startTime,
              status,
              statusMessage,
              dbUserId: dbUser?.id,
              dbLabId: dbLab?.id
            });
          }
        }
      }

      return {
        message: 'PDF processado e verificado',
        data: extractedClasses,
      };

    } catch (error) {
      this.logger.error('Erro ao processar PDF', error);
      throw new Error('Falha ao ler o arquivo PDF.');
    }
  }

  async syncGoogleCalendar() {
    // 1. Busca os dados brutos do Google
    const rawEvents = await this.googleService.getEventsFromCalendar();
    
    const validatedClasses = [] as any[];
    const userCache = new Map();
    const labCache = new Map();

    // 2. Valida cada evento com o banco de dados (Igual fizemos no PDF)
    for (const event of rawEvents) {
        // Tenta limpar o nome do Lab vindo do Google (ex: "Laboratório 02" -> "02")
        const labName = event.lab; 
        const professorName = event.professor;

        // --- LÓGICA DE BUSCA USER/LAB (Reaproveitada) ---
        
        // Busca Lab
        let dbLab: any = null;
        if (labCache.has(labName)) {
            dbLab = labCache.get(labName);
        } else {
            // Tenta achar pelo nome ou parte dele
            dbLab = await this.prisma.lab.findFirst({
                where: { name: { contains: labName } } 
            });
            labCache.set(labName, dbLab);
        }

        // Busca Usuário
        let dbUser: any = null;
        if (userCache.has(professorName)) {
            dbUser = userCache.get(professorName);
        } else {
             // Busca professor pelo primeiro nome que estiver na descrição
             // Ex: Descrição "Prof. Telmo" -> busca "Telmo"
            const searchName = professorName.replace('Prof.', '').trim().split(' ')[0];
            
            dbUser = await this.prisma.user.findFirst({
                where: { username: { contains: searchName } }
            });
            userCache.set(professorName, dbUser);
        }

        // Define Status
        let status = 'PENDENTE';
        let statusMessage = '';

        if (dbUser && dbLab) {
            status = 'PRONTO';
            statusMessage = 'OK';
        } else if (!dbUser) {
            status = 'ERRO_USER';
            statusMessage = `Prof. '${professorName}' não encontrado`;
        } else if (!dbLab) {
            status = 'ERRO_LAB';
            statusMessage = `Lab '${labName}' não encontrado`;
        }

        validatedClasses.push({
            ...event,
            status,
            statusMessage,
            dbUserId: dbUser?.id,
            dbLabId: dbLab?.id
        });
    }

    return {
        message: 'Sincronização realizada',
        data: validatedClasses
    };
  }

  async createBatch(reservations: CreateReservationDto[]) {
    const results = [] as any[];
    let successCount = 0;

    for (const res of reservations) {
      try {
        const created = await this.create(res);
        results.push({ status: 'SUCCESS', reservation: res, data: created });
        successCount++;
      } catch (error) {
        this.logger.warn(`Falha ao criar reserva em lote: ${error.message}`);
        results.push({ 
          status: 'ERROR', 
          message: error.message, 
          reservation: res 
        });
      }
    }

    return {
      totalProcessed: results.length,
      successCount,
      results
    };
  }
}