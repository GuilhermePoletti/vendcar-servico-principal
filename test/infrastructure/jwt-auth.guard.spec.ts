import { JwtAuthGuard } from '../../src/infrastructure/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

const makeContext = (authHeader?: string): ExecutionContext => ({
  switchToHttp: () => ({
    getRequest: () => ({
      headers: { authorization: authHeader },
    }),
  }),
  getHandler: () => jest.fn(),
  getClass: () => jest.fn(),
} as any);

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new JwtAuthGuard(jwtService, reflector);
  });

  it('deve permitir rotas públicas sem token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = await guard.canActivate(makeContext());

    expect(result).toBe(true);
  });

  it('deve validar token JWT e injetar payload no request', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', role: 'ADMIN' });

    const result = await guard.canActivate(makeContext('Bearer valid-jwt'));

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt');
  });

  it('deve lançar UnauthorizedException quando token ausente', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(makeContext())).rejects.toThrow(UnauthorizedException);
  });

  it('deve lançar UnauthorizedException quando token inválido', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

    await expect(guard.canActivate(makeContext('Bearer bad-token'))).rejects.toThrow(UnauthorizedException);
  });

  it('deve rejeitar header sem Bearer prefix', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(makeContext('Basic abc123'))).rejects.toThrow(UnauthorizedException);
  });
});
