import { prisma } from "../src/config/database";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.refreshToken.deleteMany({});
  await prisma.emailVerification.deleteMany({});
  await prisma.passwordReset.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { startsWith: "test_" } },
  });
});

afterEach(async () => {
  await prisma.refreshToken.deleteMany({});
  await prisma.emailVerification.deleteMany({});
  await prisma.passwordReset.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { startsWith: "test_" } },
  });
});