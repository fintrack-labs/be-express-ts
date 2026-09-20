import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
    @Get('profile')
    getProfile() {
        return {
            status: 'success',
            user: {
                id: 'usr_9921',
                name: 'Saiful HQ',
                email: 'saifulhq@example.com',
                role: 'Premium User',
            }
        };
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    registerUser(@Body() userData: { name: string; email: string }) {
        return {
            status: 'success',
            message: 'User account created successfully!',
            data: userData
        };
    }
}
