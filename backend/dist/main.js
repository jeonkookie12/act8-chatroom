"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors({
            origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        });
        app.setGlobalPrefix('api');
        await app.listen(3000);
        console.log('Server started successfully on port 3000');
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap().catch((error) => {
    console.error('Bootstrap error:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map