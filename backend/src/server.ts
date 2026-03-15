import app from './app.js';
import { env } from './config/env.js';
import { bootstrapSimulatedPayments } from './lib/simulated-payments.js';
import { assertDatabaseSchemaCompatibility } from './lib/startup-checks.js';

async function start() {
  await assertDatabaseSchemaCompatibility();

  app.listen(env.port, () => {
    console.log(`Seranet backend running on port ${env.port}`);
    void bootstrapSimulatedPayments();
  });
}

void start().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
