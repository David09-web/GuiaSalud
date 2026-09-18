import { createApp } from './app';
import { ENV } from './config/env';
import { testDbConnection } from './config/database';

const startServer = async () => {
  const app = createApp();

  // Test conexión a PostgreSQL
  await testDbConnection();

  app.listen(ENV.PORT, () => {
    console.log('====================================================');
    console.log(`🚀 [GuiaSalud API] Servidor activo en puerto ${ENV.PORT}`);
    console.log(`📡 URL Base: http://localhost:${ENV.PORT}${ENV.API_PREFIX}`);
    console.log(`🩺 Healthcheck: http://localhost:${ENV.PORT}${ENV.API_PREFIX}/health`);
    console.log(`👤 Responsable Backend: David Marcet Ospina`);
    console.log(`🎯 Entorno: ${ENV.NODE_ENV}`);
    console.log('====================================================');
  });
};

startServer().catch((err) => {
  console.error('❌ Error fatal iniciando el servidor Backend:', err);
  process.exit(1);
});
