import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import prisma from "../lib/prisma.js";

async function main() {
  const defaultPassword = "Password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const defaultUsers = [
    {
      username: "admin",
      first_name: "System",
      middle_name: null,
      last_name: "Admin",
      dob: new Date("1995-01-01"),
      gender: "Male" as const,
      role: "Admin" as const,
      qr_code: `USER-${randomUUID()}`,
      password: hashedPassword,
      is_active: true,
    },
    {
      username: "guard",
      first_name: "Campus",
      middle_name: null,
      last_name: "Guard",
      dob: new Date("1996-01-01"),
      gender: "Male" as const,
      role: "Guard" as const,
      qr_code: `USER-${randomUUID()}`,
      password: hashedPassword,
      is_active: true,
    },
    {
      username: "resident",
      first_name: "Default",
      middle_name: null,
      last_name: "Resident",
      dob: new Date("2003-01-01"),
      gender: "Female" as const,
      role: "Resident" as const,
      qr_code: `USER-${randomUUID()}`,
      password: hashedPassword,
      is_active: true,
    },
  ];

  console.log("Seeding default users...");

  for (const user of defaultUsers) {
    const existing = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (existing) {
      await prisma.user.update({
        where: { username: user.username },
        data: {
          role: user.role,
          password: hashedPassword,
          is_active: true,
        },
      });
      console.log(`Updated existing user: ${user.username} (${user.role})`);
    } else {
      await prisma.user.create({
        data: user,
      });
      console.log(`Created user: ${user.username} (${user.role})`);
    }
  }

  console.log("\nDefault credentials:");
  console.log("-----------------------------------------");
  for (const u of defaultUsers) {
    console.log(`Role: ${u.role.padEnd(8)} | Username: ${u.username.padEnd(10)} | Password: ${defaultPassword}`);
  }
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
