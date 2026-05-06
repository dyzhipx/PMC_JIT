import { returnFromLine } from '../src/services/production.service.ts';

async function test() {
  const result = await returnFromLine('00003', 1000, undefined, 'sisa');
  console.log('Test Result:', result);
  process.exit(0);
}
test().catch((e) => {
  console.error(e);
  process.exit(1);
});
