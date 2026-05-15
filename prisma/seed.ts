import { PrismaClient, Role, PhaseStatus, ActivityStatus, RegistrationStatus } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Profiles (link to existing Supabase users via placeholder UUIDs) ────────
  // Note: these profiles need matching Supabase Auth users, or supabaseId can be
  // any UUID for local testing without auth flows.

  const admin = await prisma.profile.upsert({
    where: { email: "admin@fzluzern.ch" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000001",
      role: Role.ADMIN,
      firstName: "Sandra",
      lastName: "Meier",
      email: "admin@fzluzern.ch",
      phone: "041 123 00 01",
    },
  });

  const instructor1 = await prisma.profile.upsert({
    where: { email: "leiter1@fzluzern.ch" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000002",
      role: Role.INSTRUCTOR,
      firstName: "Marco",
      lastName: "Brunner",
      email: "leiter1@fzluzern.ch",
      phone: "041 123 00 02",
    },
  });

  const instructor2 = await prisma.profile.upsert({
    where: { email: "leiter2@fzluzern.ch" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000003",
      role: Role.INSTRUCTOR,
      firstName: "Julia",
      lastName: "Hess",
      email: "leiter2@fzluzern.ch",
    },
  });

  const parent1 = await prisma.profile.upsert({
    where: { email: "eltern1@example.com" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000004",
      role: Role.PARENT,
      firstName: "Thomas",
      lastName: "Müller",
      email: "eltern1@example.com",
      phone: "079 111 22 33",
    },
  });

  const parent2 = await prisma.profile.upsert({
    where: { email: "eltern2@example.com" },
    update: {},
    create: {
      supabaseId: "00000000-0000-0000-0000-000000000005",
      role: Role.PARENT,
      firstName: "Anna",
      lastName: "Weber",
      email: "eltern2@example.com",
    },
  });

  console.log("✓ Profiles created");

  // ─── Children ─────────────────────────────────────────────────────────────────
  const child1 = await prisma.child.upsert({
    where: { id: "child-seed-0001-0000-0000-000000000001" },
    update: {},
    create: {
      id: "child-seed-0001-0000-0000-000000000001",
      parentId: parent1.id,
      firstName: "Lena",
      lastName: "Müller",
      dateOfBirth: new Date("2015-03-14"),
      emergencyName: "Thomas Müller",
      emergencyPhone: "079 111 22 33",
    },
  });

  const child2 = await prisma.child.upsert({
    where: { id: "child-seed-0002-0000-0000-000000000002" },
    update: {},
    create: {
      id: "child-seed-0002-0000-0000-000000000002",
      parentId: parent1.id,
      firstName: "Jonas",
      lastName: "Müller",
      dateOfBirth: new Date("2017-07-22"),
      medicalNotes: "Laktoseintoleranz",
    },
  });

  const child3 = await prisma.child.upsert({
    where: { id: "child-seed-0003-0000-0000-000000000003" },
    update: {},
    create: {
      id: "child-seed-0003-0000-0000-000000000003",
      parentId: parent2.id,
      firstName: "Mia",
      lastName: "Weber",
      dateOfBirth: new Date("2014-11-05"),
    },
  });

  console.log("✓ Children created");

  // ─── Course Phases ────────────────────────────────────────────────────────────
  const phase = await prisma.coursePhase.upsert({
    where: { id: "phase-seed-0001-0000-0000-000000000001" },
    update: {},
    create: {
      id: "phase-seed-0001-0000-0000-000000000001",
      name: "Sommer 2025",
      status: PhaseStatus.REGISTRATION_OPEN,
      registrationStart: new Date("2025-05-01"),
      registrationEnd: new Date("2025-06-15"),
      allocationDate: new Date("2025-06-20"),
      executionStart: new Date("2025-07-07"),
      executionEnd: new Date("2025-08-22"),
    },
  });

  const phaseArchived = await prisma.coursePhase.upsert({
    where: { id: "phase-seed-0002-0000-0000-000000000002" },
    update: {},
    create: {
      id: "phase-seed-0002-0000-0000-000000000002",
      name: "Winter 2024",
      status: PhaseStatus.ARCHIVED,
      registrationStart: new Date("2024-11-01"),
      registrationEnd: new Date("2024-12-01"),
      executionStart: new Date("2024-12-27"),
      executionEnd: new Date("2025-01-03"),
    },
  });

  console.log("✓ Phases created");

  // ─── Activities ───────────────────────────────────────────────────────────────
  const act1 = await prisma.activity.upsert({
    where: { id: "act-seed-00001-0000-0000-000000000001" },
    update: {},
    create: {
      id: "act-seed-00001-0000-0000-000000000001",
      phaseId: phase.id,
      instructorId: instructor1.id,
      title: "Klettern für Kinder",
      description: "Spannende Kletterkurse für Kinder von 7–12 Jahren in der städtischen Kletterhalle Luzern. Alle Materialien werden gestellt.",
      status: ActivityStatus.REGISTRATION,
      capacity: 12,
      minAge: 7,
      maxAge: 12,
      location: "Kletterhalle Luzern",
      executions: {
        create: [
          { startDate: new Date("2025-07-07"), endDate: new Date("2025-07-07"), location: "Kletterhalle Luzern" },
          { startDate: new Date("2025-07-14"), endDate: new Date("2025-07-14"), location: "Kletterhalle Luzern" },
          { startDate: new Date("2025-07-21"), endDate: new Date("2025-07-21"), location: "Kletterhalle Luzern" },
        ],
      },
    },
  });

  const act2 = await prisma.activity.upsert({
    where: { id: "act-seed-00002-0000-0000-000000000002" },
    update: {},
    create: {
      id: "act-seed-00002-0000-0000-000000000002",
      phaseId: phase.id,
      instructorId: instructor2.id,
      title: "Kreatives Malen",
      description: "Entdecke die Welt der Farben! Wir malen mit Acryl, Wasserfarben und weiteren Techniken. Für Kinder von 6–10 Jahren.",
      status: ActivityStatus.REGISTRATION,
      capacity: 8,
      minAge: 6,
      maxAge: 10,
      location: "Atelier Stadtmitte",
      executions: {
        create: [
          { startDate: new Date("2025-07-08"), endDate: new Date("2025-07-08") },
          { startDate: new Date("2025-07-15"), endDate: new Date("2025-07-15") },
        ],
      },
    },
  });

  const act3 = await prisma.activity.upsert({
    where: { id: "act-seed-00003-0000-0000-000000000003" },
    update: {},
    create: {
      id: "act-seed-00003-0000-0000-000000000003",
      phaseId: phase.id,
      instructorId: instructor1.id,
      title: "Fussballcamp",
      description: "Einwöchiges Fussballcamp auf der Sportanlage Luzern. Training, Technik und Spass.",
      status: ActivityStatus.REGISTRATION,
      capacity: 20,
      minAge: 8,
      maxAge: 14,
      location: "Sportanlage Allmend",
      executions: {
        create: [
          { startDate: new Date("2025-08-04"), endDate: new Date("2025-08-08"), notes: "Mo–Fr ganztags" },
        ],
      },
    },
  });

  const act4 = await prisma.activity.upsert({
    where: { id: "act-seed-00004-0000-0000-000000000004" },
    update: {},
    create: {
      id: "act-seed-00004-0000-0000-000000000004",
      phaseId: phase.id,
      instructorId: instructor2.id,
      title: "Theaterwerkstatt",
      description: "Kreatives Schauspiel für Jugendliche. Wir erarbeiten ein kurzes Stück und führen es am Ende auf.",
      status: ActivityStatus.DRAFT,
      capacity: 15,
      minAge: 10,
      maxAge: 16,
    },
  });

  console.log("✓ Activities created");

  // ─── Registrations ────────────────────────────────────────────────────────────
  await prisma.registration.upsert({
    where: { activityId_childId: { activityId: act1.id, childId: child1.id } },
    update: {},
    create: {
      activityId: act1.id,
      childId: child1.id,
      parentId: parent1.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });

  await prisma.registration.upsert({
    where: { activityId_childId: { activityId: act2.id, childId: child1.id } },
    update: {},
    create: {
      activityId: act2.id,
      childId: child1.id,
      parentId: parent1.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });

  await prisma.registration.upsert({
    where: { activityId_childId: { activityId: act1.id, childId: child3.id } },
    update: {},
    create: {
      activityId: act1.id,
      childId: child3.id,
      parentId: parent2.id,
      status: RegistrationStatus.WAITLISTED,
      waitlistPos: 1,
    },
  });

  console.log("✓ Registrations created");

  // ─── News Posts ───────────────────────────────────────────────────────────────
  await prisma.newsPost.upsert({
    where: { id: "news-seed-0001-0000-0000-000000000001" },
    update: {},
    create: {
      id: "news-seed-0001-0000-0000-000000000001",
      title: "Anmeldung Sommer 2025 ist geöffnet!",
      body: "Die Anmeldung für das Sommerprogramm 2025 ist ab sofort geöffnet. Dieses Jahr bieten wir wieder eine grosse Auswahl an Aktivitäten für Kinder und Jugendliche an.\n\nMelden Sie sich jetzt an und sichern Sie sich einen Platz für Ihr Kind. Die Plätze sind begrenzt!",
      authorId: admin.id,
      publishedAt: new Date("2025-05-01"),
    },
  });

  await prisma.newsPost.upsert({
    where: { id: "news-seed-0002-0000-0000-000000000002" },
    update: {},
    create: {
      id: "news-seed-0002-0000-0000-000000000002",
      title: "Neues Angebot: Theaterwerkstatt",
      body: "Wir freuen uns, eine neue Theaterwerkstatt für Jugendliche anzukündigen. Unter der Leitung von Julia Hess werden die Teilnehmenden ein eigenes Stück erarbeiten.\n\nDie Anmeldung folgt in Kürze.",
      authorId: admin.id,
      publishedAt: new Date("2025-05-10"),
    },
  });

  await prisma.newsPost.upsert({
    where: { id: "news-seed-0003-0000-0000-000000000003" },
    update: {},
    create: {
      id: "news-seed-0003-0000-0000-000000000003",
      title: "Entwurf: Winterprogramm 2025",
      body: "Dieser Beitrag ist noch nicht veröffentlicht.",
      authorId: admin.id,
      publishedAt: null,
    },
  });

  console.log("✓ News posts created");

  // ─── Info Pages ───────────────────────────────────────────────────────────────
  await prisma.infoPage.upsert({
    where: { slug: "ueber-uns" },
    update: {},
    create: {
      slug: "ueber-uns",
      title: "Über uns",
      body: "Das Portal Freizeit Luzern ist ein Angebot der Stadt Luzern für Kinder und Jugendliche. Wir organisieren Kurse, Camps und Workshops in den Bereichen Sport, Kunst und Kultur.\n\nUnser Ziel ist es, Kindern und Jugendlichen aus allen Verhältnissen einen Zugang zu qualitativ hochwertigen Freizeitangeboten zu ermöglichen.",
    },
  });

  await prisma.infoPage.upsert({
    where: { slug: "kontakt" },
    update: {},
    create: {
      slug: "kontakt",
      title: "Kontakt",
      body: "Freizeit Luzern\nKultur und Sport\nStadt Luzern\n\nE-Mail: freizeit@stadtluzern.ch\nTelefon: 041 208 78 00\n\nBürozeiten: Mo–Fr, 08:00–17:00 Uhr",
    },
  });

  await prisma.infoPage.upsert({
    where: { slug: "faq" },
    update: {},
    create: {
      slug: "faq",
      title: "Häufige Fragen (FAQ)",
      body: "Wie melde ich mein Kind an?\nSie benötigen ein Konto auf diesem Portal. Nach der Registrierung können Sie Ihr Kind erfassen und für Aktivitäten anmelden.\n\nWas passiert, wenn ein Kurs ausgebucht ist?\nIhr Kind kommt auf die Warteliste. Bei einer Absage wird Ihr Kind automatisch nachrücken.\n\nKann ich eine Anmeldung stornieren?\nJa, Anmeldungen können bis zur Zuteilung storniert werden.",
    },
  });

  console.log("✓ Info pages created");
  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
