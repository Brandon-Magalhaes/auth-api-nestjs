import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/auth/decorators/user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@User('email') email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new NotFoundException('User not found');

        return {
            id: user.id,
            email: user.email,
        };
    }

}
