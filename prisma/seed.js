import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const Role = {
  VIEWER: 'VIEWER',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
};

const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
};

const Category = {
  SALARY: 'SALARY',
  FREELANCE: 'FREELANCE',
  INVESTMENT: 'INVESTMENT',
  FOOD: 'FOOD',
  TRANSPORT: 'TRANSPORT',
  UTILITIES: 'UTILITIES',
  ENTERTAINMENT: 'ENTERTAINMENT',
  HEALTHCARE: 'HEALTHCARE',
  SHOPPING: 'SHOPPING',
  EDUCATION: 'EDUCATION',
  TRAVEL: 'TRAVEL',
  OTHER: 'OTHER',
};

const EventAction = {
  USER_LOGIN: 'USER_LOGIN',
  USER_REGISTERED: 'USER_REGISTERED',
  TRANSACTION_CREATED: 'TRANSACTION_CREATED',
  ANOMALY_DETECTED: 'ANOMALY_DETECTED',
};

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  console.log('Cleaning existing data...');
  await prisma.event.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.analyticsCache.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Creating users...');
  
  const adminPassword = await hashPassword('Admin123!');
  const analystPassword = await hashPassword('Analyst123!');
  const viewerPassword = await hashPassword('Viewer123!');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ifcs.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      lastActiveAt: new Date(),
      lastAction: 'Account created',
    },
  });
  
  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@ifcs.com',
      password: analystPassword,
      name: 'Analyst User',
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
      lastActiveAt: new Date(),
      lastAction: 'Account created',
    },
  });
  
  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@ifcs.com',
      password: viewerPassword,
      name: 'Viewer User',
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
      lastActiveAt: new Date(),
      lastAction: 'Account created',
    },
  });
  
  console.log('✅ Created users: admin, analyst, viewer\n');
  
  console.log('Setting up permissions...');
  
  const permissions = [
    { role: Role.VIEWER, resource: 'transactions', action: 'read' },
    { role: Role.VIEWER, resource: 'analytics', action: 'read:basic' },
    { role: Role.VIEWER, resource: 'events', action: 'read:own' },
    { role: Role.ANALYST, resource: 'transactions', action: 'read' },
    { role: Role.ANALYST, resource: 'analytics', action: 'read:basic' },
    { role: Role.ANALYST, resource: 'analytics', action: 'read:insights' },
    { role: Role.ANALYST, resource: 'analytics', action: 'read:trends' },
    { role: Role.ANALYST, resource: 'analytics', action: 'read:health' },
    { role: Role.ANALYST, resource: 'events', action: 'read:own' },
    { role: Role.ANALYST, resource: 'users', action: 'read:own' },
    { role: Role.ADMIN, resource: 'transactions', action: 'create' },
    { role: Role.ADMIN, resource: 'transactions', action: 'read' },
    { role: Role.ADMIN, resource: 'transactions', action: 'update' },
    { role: Role.ADMIN, resource: 'transactions', action: 'delete' },
    { role: Role.ADMIN, resource: 'transactions', action: 'restore' },
    { role: Role.ADMIN, resource: 'analytics', action: 'read:basic' },
    { role: Role.ADMIN, resource: 'analytics', action: 'read:insights' },
    { role: Role.ADMIN, resource: 'analytics', action: 'read:trends' },
    { role: Role.ADMIN, resource: 'analytics', action: 'read:health' },
    { role: Role.ADMIN, resource: 'analytics', action: 'export' },
    { role: Role.ADMIN, resource: 'events', action: 'read:all' },
    { role: Role.ADMIN, resource: 'users', action: 'create' },
    { role: Role.ADMIN, resource: 'users', action: 'read' },
    { role: Role.ADMIN, resource: 'users', action: 'update' },
    { role: Role.ADMIN, resource: 'users', action: 'delete' },
  ];
  
  for (const perm of permissions) {
    await prisma.permission.create({ data: perm });
  }
  
  console.log('✅ Created ' + permissions.length + ' permissions\n');
  
  console.log('Creating sample transactions...');
  
  const categories = Object.values(Category);
  const today = new Date();
  const transactions = [];
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const txCount = Math.floor(Math.random() * 4) + 1;
    
    for (let j = 0; j < txCount; j++) {
      const isIncome = Math.random() > 0.7;
      const category = isIncome 
        ? (Math.random() > 0.5 ? Category.SALARY : Category.FREELANCE)
        : categories[Math.floor(Math.random() * (categories.length - 2)) + 2];
      
      const amount = isIncome 
        ? Math.round((Math.random() * 3000 + 1000) * 100) / 100
        : Math.round((Math.random() * 200 + 10) * 100) / 100;
      
      const isAnomaly = Math.random() > 0.95;
      const finalAmount = isAnomaly ? amount * 3 : amount;
      
      transactions.push({
        userId: Math.random() > 0.5 ? admin.id : analyst.id,
        amount: finalAmount,
        type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
        category,
        date,
        notes: getRandomNote(category),
        tags: getRandomTags(),
        isAnomaly,
        anomalyReason: isAnomaly ? 'Amount significantly higher than average' : null,
        anomalyScore: isAnomaly ? 0.75 : null,
      });
    }
  }
  
  for (const tx of transactions.sort(() => Math.random() - 0.5)) {
    await prisma.transaction.create({ data: tx });
  }
  
  console.log('✅ Created ' + transactions.length + ' transactions\n');
  
  console.log('Creating sample events...');
  
  await prisma.event.create({
    data: { userId: admin.id, action: EventAction.USER_REGISTERED, entityType: 'User', entityId: admin.id }
  });
  await prisma.event.create({
    data: { userId: analyst.id, action: EventAction.USER_REGISTERED, entityType: 'User', entityId: analyst.id }
  });
  await prisma.event.create({
    data: { userId: viewer.id, action: EventAction.USER_REGISTERED, entityType: 'User', entityId: viewer.id }
  });
  await prisma.event.create({
    data: { userId: admin.id, action: EventAction.USER_LOGIN, entityType: 'User', entityId: admin.id }
  });
  await prisma.event.create({
    data: { userId: analyst.id, action: EventAction.USER_LOGIN, entityType: 'User', entityId: analyst.id }
  });
  
  let eventCount = 5;
  
  const createdTxs = await prisma.transaction.findMany({ take: 10 });
  for (const tx of createdTxs) {
    await prisma.event.create({
      data: {
        userId: tx.userId,
        action: EventAction.TRANSACTION_CREATED,
        entityType: 'Transaction',
        entityId: tx.id,
        payload: { amount: tx.amount, type: tx.type, category: tx.category },
      }
    });
    eventCount++;
    
    if (tx.isAnomaly) {
      await prisma.event.create({
        data: {
          userId: tx.userId,
          action: EventAction.ANOMALY_DETECTED,
          entityType: 'Transaction',
          entityId: tx.id,
          payload: { reason: tx.anomalyReason },
        }
      });
      eventCount++;
    }
  }
  
  console.log('✅ Created ' + eventCount + ' events\n');
  
  console.log('🎉 Seed completed successfully!\n');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:   admin@ifcs.com   / Admin123!');
  console.log('Analyst: analyst@ifcs.com / Analyst123!');
  console.log('Viewer:  viewer@ifcs.com  / Viewer123!');
  console.log('─────────────────────────────────────\n');
}

function getRandomNote(category) {
  const notes = {
    SALARY: ['Monthly salary', 'Salary payment', 'Regular income'],
    FREELANCE: ['Client project', 'Consulting fee', 'Contract work'],
    INVESTMENT: ['Dividend payment', 'Stock sale', 'Interest income'],
    FOOD: ['Grocery shopping', 'Restaurant dinner', 'Lunch', 'Coffee'],
    TRANSPORT: ['Uber ride', 'Gas station', 'Parking fee', 'Train ticket'],
    UTILITIES: ['Electric bill', 'Water bill', 'Internet bill', 'Phone bill'],
    ENTERTAINMENT: ['Netflix subscription', 'Movie tickets', 'Concert', 'Gaming'],
    HEALTHCARE: ['Doctor visit', 'Pharmacy', 'Gym membership', 'Medical checkup'],
    SHOPPING: ['Amazon order', 'Clothing', 'Electronics', 'Home goods'],
    EDUCATION: ['Online course', 'Books', 'Certification', 'Workshop'],
    TRAVEL: ['Hotel booking', 'Flight ticket', 'Vacation expense', 'Travel gear'],
    OTHER: ['Miscellaneous', 'Various expenses', 'Other payment'],
  };
  
  const options = notes[category] || notes.OTHER;
  return options[Math.floor(Math.random() * options.length)];
}

function getRandomTags() {
  const allTags = ['essential', 'recurring', 'one-time', 'business', 'personal', 'urgent', 'planned'];
  const count = Math.floor(Math.random() * 3);
  const tags = [];
  
  for (let i = 0; i < count; i++) {
    const tag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(tag)) tags.push(tag);
  }
  
  return tags;
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\();
  });
