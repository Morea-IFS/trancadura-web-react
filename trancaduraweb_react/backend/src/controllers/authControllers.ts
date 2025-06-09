// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { prisma } from '../config/database';
// import { ApiResponse } from '../types';

// export class AuthController {
//   static async signIn(req: Request, res: Response): Promise<void> {
//     try {
//       const { email, password } = req.body;

//       // Validação básica
//       if (!email || !password) {
//         res.status(400).json({
//           success: false,
//           error: 'Email and password are required'
//         } as ApiResponse);
//         return;
//       }

//       // Buscar usuário
//       const user = await prisma.user.findUnique({
//         where: { email: email.toLowerCase() },
//         include: {
//           roles: {
//             include: {
//               role: true
//             }
//           }
//         }
//       });

//       if (!user) {
//         res.status(401).json({
//           success: false,
//           error: 'Invalid credentials'
//         } as ApiResponse);
//         return;
//       }

//       // Verificar senha
//       const isValidPassword = await bcrypt.compare(password, user.password);
//       if (!isValidPassword) {
//         res.status(401).json({
//           success: false,
//           error: 'Invalid credentials'
//         } as ApiResponse);
//         return;
//       }

//       // Verificar se usuário está ativo
//       if (!user.isActive) {
//         res.status(401).json({
//           success: false,
//           error: 'Account is deactivated'
//         } as ApiResponse);
//         return;
//       }

//       // Gerar JWT token
//       const token = jwt.sign(
//         { userId: user.id },
//         process.env.JWT_SECRET!,
//         { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//       );

//       // Resposta sem senha
//       const userResponse = {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         isActive: user.isActive,
//         isStaff: user.isStaff,
//         isSuperuser: user.isSuperuser,
//         roles: user.roles
//       };

//       res.status(200).json({
//         success: true,
//         data: {
//           user: userResponse,
//           token
//         },
//         message: 'Signed in successfully'
//       } as ApiResponse);

//     } catch (error) {
//       console.error('Sign in error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       } as ApiResponse);
//     }
//   }

//   static async signUp(req: Request, res: Response): Promise<void> {
//     try {
//       const { email, username, password, firstName, lastName } = req.body;

//       // Validação básica
//       if (!email || !username || !password) {
//         res.status(400).json({
//           success: false,
//           error: 'Email, username, and password are required'
//         } as ApiResponse);
//         return;
//       }

//       // Verificar se usuário já existe
//       const existingUser = await prisma.user.findFirst({
//         where: {
//           OR: [
//             { email: email.toLowerCase() },
//             { username }
//           ]
//         }
//       });

//       if (existingUser) {
//         res.status(409).json({
//           success: false,
//           error: 'User with this email or username already exists'
//         } as ApiResponse);
//         return;
//       }

//       // Hash da senha
//       const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

//       // Criar usuário
//       const user = await prisma.user.create({
//         data: {
//           email: email.toLowerCase(),
//           username,
//           password: hashedPassword,
//           firstName: firstName || null,
//           lastName: lastName || null
//         },
//         include: {
//           roles: {
//             include: {
//               role: true
//             }
//           }
//         }
//       });

//       // Gerar JWT token
//       const token = jwt.sign(
//         { userId: user.id },
//         process.env.JWT_SECRET!,
//         { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//       );

//       // Resposta sem senha
//       const userResponse = {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         isActive: user.isActive,
//         isStaff: user.isStaff,
//         isSuperuser: user.isSuperuser,
//         roles: user.roles
//       };

//       res.status(201).json({
//         success: true,
//         data: {
//           user: userResponse,
//           token
//         },
//         message: 'User created successfully'
//       } as ApiResponse);

//     } catch (error) {
//       console.error('Sign up error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       } as ApiResponse);
//     }
//   }

//   static async me(req: Request, res: Response): Promise<void> {
//     try {
//       if (!req.user) {
//         res.status(401).json({
//           success: false,
//           error: 'Authentication required'
//         } as ApiResponse);
//         return;
//       }

//       res.status(200).json({
//         success: true,
//         data: req.user
//       } as ApiResponse);

//     } catch (error) {
//       console.error('Get user error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       } as ApiResponse);
//     }
//   }

//   static async logout(req: Request, res: Response): Promise<void> {
//     // Com JWT, o logout é feito no frontend removendo o token
//     // Aqui podemos implementar blacklist de tokens se necessário
//     res.status(200).json({
//       success: true,
//       message: 'Logged out successfully'
//     } as ApiResponse);
//   }
// }