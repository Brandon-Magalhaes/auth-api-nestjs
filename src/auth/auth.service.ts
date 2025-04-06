// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signup(dto: SignupDto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) throw new ConflictException('E-mail já está em uso');

        const hash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create(dto.email, hash);

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return tokens;
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Credenciais inválidas');

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return tokens;
    }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_REFRESH_SECRET,
        });

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    private async updateRefreshToken(userId: string, rt: string) {
        const hash = await bcrypt.hash(rt, 10);
        await this.usersService.updateUser(userId, { refreshToken: hash });
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const user = await this.usersService.findByEmail(payload.email);
            if (!user || !user.refreshToken) throw new UnauthorizedException();

            const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!isMatch) throw new UnauthorizedException();

            const tokens = await this.generateTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refresh_token);

            return tokens;
        } catch {
            throw new UnauthorizedException();
        }
    }

}
