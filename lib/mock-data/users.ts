export interface MockUser {
  id: number;
  email: string;
  password: string;
  name: string;
  partnerId: number;
  companyName: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    email: "admin@metalurgicacuyo.com.ar",
    password: "demo1234",
    name: "Carlos Méndez",
    partnerId: 42,
    companyName: "Metalúrgica Cuyo S.R.L.",
  },
];

export function findMockUser(
  email: string,
  password: string,
): MockUser | undefined {
  return MOCK_USERS.find((u) => u.email === email && u.password === password);
}
