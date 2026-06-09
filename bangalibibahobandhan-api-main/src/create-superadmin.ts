import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'sikdar2010@gmail.com';
  const password = '12345678*Sp';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if superadmin already exists
  const existingAdmin = await prisma.team.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Superadmin already exists with email:', email);
    return;
  }

  // Calculate the next internalId
  const lastTeam = await prisma.team.findFirst({
    orderBy: { internalId: 'desc' },
  });
  const nextInternalId = lastTeam ? lastTeam.internalId + 1 : 1;

  // Create Super Admin in Team
  const team = await prisma.team.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      gender: 'MALE',
      phone: Date.now().toString().slice(-10), // Unique phone
      email: email,
      role: 'SUPERADMIN',
      internalId: nextInternalId,
      emailVerified: true,
      isProfileComplete: true,
    },
  });

  // Create Team Account for login
  await prisma.teamAccount.create({
    data: {
      accountId: email,
      providerId: 'credential',
      userId: team.id,
      password: hashedPassword,
    },
  });

  console.log('✅ Super Admin created successfully!');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
}

main()
  .catch((e) => {
    console.error('Error creating super admin:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
