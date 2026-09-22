import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose';

@Injectable()
export class JwksService implements OnModuleInit {
    private readonly logger = new Logger(JwksService.name);
    private jwksClient: ReturnType<typeof createRemoteJWKSet>;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        const jwksUri =
            this.configService.get<string>('BE_AUTH_JWKS_URI') ||
            'http://localhost:8081/auth/api/.well-known/jwks.json';
        this.jwksClient = createRemoteJWKSet(new URL(jwksUri));
        this.logger.log(`Initializing JWKS client from: ${jwksUri}`);
    }

    async verifyToken(token: string) {
        try {
            const header = decodeProtectedHeader(token);
            this.logger.debug(
                `[DEBUG] Incoming Token Header -> alg: "${header.alg}", kid: "${header.kid}"`,
            );
            const { payload } = await jwtVerify(token, this.jwksClient)
            this.logger.log(`[SUCCESS] Token verified for subject (sub): ${payload.sub}`);
            return payload;
        } catch (error) {
            this.logger.error(`[ERROR] Invalid access token: ${error}`);
            throw new UnauthorizedException("Invalid access token");
        }
    }
}
