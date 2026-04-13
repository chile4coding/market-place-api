export interface TestUser {
  email: string;
  password: string;
  role: "BUYER" | "SELLER";
}

export const generateTestEmail = (prefix: string = "test"): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
};

export const createTestUser = async (
  role: "BUYER" | "SELLER" = "BUYER",
): Promise<TestUser> => {
  const email = generateTestEmail();
  return {
    email,
    password: "TestPassword123",
    role,
  };
};

export const createUnverifiedUser = async (
  role: "BUYER" | "SELLER" = "BUYER",
): Promise<TestUser> => {
  const user = await createTestUser(role);
  return user;
};

export const createVerifiedUser = async (
  role: "BUYER" | "SELLER" = "BUYER",
): Promise<TestUser> => {
  const user = await createTestUser(role);
  return user;
};