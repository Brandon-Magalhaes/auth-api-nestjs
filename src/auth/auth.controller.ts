import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    @ApiBody({
        schema: {
            example: {
                email: 'teste@testee.com',
                password: '123456',
            },
        },
    })
    signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }

    @Post('login')
    @ApiBody({
        schema: {
            example: {
                email: 'teste@testee.com',
                password: '123456',
            },
        },
    })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @ApiBody({
        schema: {
            example: {
                refresh_token: 'token_aqui',
            },
        },
    })
    refresh(@Body() body: any) {
        return this.authService.refreshToken(body.refresh_token);
    }
}
