import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { prisma } from '../config/database';
import { ApiResponse, CreateDeviceInput, UpdateDeviceIpInput } from '../types';

export class DeviceController {
  // Equivalente ao identifyDevice do Django
  static async identifyDevice(req: Request, res: Response): Promise<void> {
    try {
      const { macAddress }: CreateDeviceInput = req.body;

      if (!macAddress) {
        res.status(400).json({
          success: false,
          error: 'MAC Address is required'
        } as ApiResponse);
        return;
      }

      // Verificar se dispositivo já existe
      let device = await prisma.device.findUnique({
        where: { macAddress }
      });

      if (device) {
        // Atualizar token API
        const apiToken = uuidv4();
        device = await prisma.device.update({
          where: { id: device.id },
          data: { apiToken }
        });

        res.status(200).json({
          success: true,
          data: {
            id: device.uuid,
            api_token: apiToken
          }
        } as ApiResponse);
      } else {
        // Criar novo dispositivo
        const uuid = uuidv4();
        const apiToken = uuidv4();

        device = await prisma.device.create({
          data: {
            uuid,
            macAddress,
            apiToken
          }
        });

        res.status(201).json({
          success: true,
          data: {
            id: uuid,
            api_token: apiToken
          }
        } as ApiResponse);
      }

    } catch (error) {
      console.error('Identify device error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      } as ApiResponse);
    }
  }

  // Equivalente ao getDeviceIp do Django
  static async updateDeviceIp(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, deviceIp, apiToken }: UpdateDeviceIpInput = req.body;

      if (!deviceId || !deviceIp || !apiToken) {
        res.status(400).json({
          success: false,
          error: 'Device ID, IP, and API token are required'
        } as ApiResponse);
        return;
      }

      // Verificar se dispositivo existe
      const device = await prisma.device.findUnique({
        where: { uuid: deviceId }
      });

      if (!device) {
        res.status(404).json({
          success: false,
          error: 'Device not found'
        } as ApiResponse);
        return;
      }

      // Verificar API token
      if (device.apiToken !== apiToken) {
        res.status(401).json({
          success: false,
          error: 'Invalid API token'
        } as ApiResponse);
        return;
      }

      // Atualizar IP
      await prisma.device.update({
        where: { id: device.id },
        data: { ipAddress: deviceIp }
      });

      res.status(200).json({
        success: true,
        message: 'IP address updated successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Update device IP error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      } as ApiResponse);
    }
  }

  // Equivalente ao manageAmbients do Django
  static async getAccessibleDevices(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const userRoles = req.user.roles.map(ur => ur.role.id);

      // Buscar dispositivos que o usuário tem acesso
      const devices = await prisma.device.findMany({
        where: {
          AND: [
            { location: { not: null } },
            {
              roles: {
                some: {
                  roleId: { in: userRoles }
                }
              }
            }
          ]
        },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { section: 'asc' }
      });

      // Agrupar por seção
      const devicesBySection = devices.reduce((acc, device) => {
        const section = device.section || 'Sem Seção';
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(device);
        return acc;
      }, {} as Record<string, typeof devices>);

      res.status(200).json({
        success: true,
        data: {
          devices,
          devicesBySection,
          userRoles: req.user.roles
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Get accessible devices error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      } as ApiResponse);
    }

    }}