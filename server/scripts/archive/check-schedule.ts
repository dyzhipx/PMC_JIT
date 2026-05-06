import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function checkSchedules() {
  const dStr = "2026-04-10";
  const start = new Date(dStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const schedules = await db.schedule.findMany({
    where: {
      date: { gte: start, lt: end }
    }
  });

  console.log(`Banyak schedule untuk tanggal ${dStr}:`, schedules.length);
  if (schedules.length > 0) {
    console.log("Sample:", schedules[0]);
  }
}

checkSchedules().finally(() => db.$disconnect());
