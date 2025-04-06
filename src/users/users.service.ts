// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) { }

    async create(email: string, password: string) {
        const user = this.usersRepo.create({ email, password });
        return this.usersRepo.save(user);
    }

    async findByEmail(email: string) {
        return this.usersRepo.findOne({ where: { email } });
    }

    async updateUser(id: string, data: Partial<User>) {
        await this.usersRepo.update({ id }, data);
    }

}
