const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create users
    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone_number: '+1234567890',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone_number: '+0987654321',
      },
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        phone_number: '+1122334455',
      },
    });

    console.log('Created users:', { user1, user2, user3 });

    // Create policies
    const policy1 = await prisma.policy.create({
      data: {
        policy_number: 'POL-001-2025',
        user_id: user1.id,
        coverage_details: JSON.stringify(['Hospitalization', 'Surgery', 'Consultation']),
        exclusions: JSON.stringify(['Cosmetic Surgery', 'Pre-existing conditions']),
        start_date: new Date('2025-01-01'),
        end_date: new Date('2026-01-01'),
      },
    });

    const policy2 = await prisma.policy.create({
      data: {
        policy_number: 'POL-002-2025',
        user_id: user2.id,
        coverage_details: JSON.stringify(['Hospitalization', 'Emergency', 'Dental']),
        exclusions: JSON.stringify(['Experimental treatments']),
        start_date: new Date('2025-02-15'),
        end_date: new Date('2026-02-15'),
      },
    });

    const policy3 = await prisma.policy.create({
      data: {
        policy_number: 'POL-003-2025',
        user_id: user3.id,
        coverage_details: JSON.stringify(['Hospitalization', 'Maternity', 'Preventive Care']),
        exclusions: JSON.stringify(['Self-inflicted injuries', 'Cosmetic Surgery']),
        start_date: new Date('2025-03-10'),
        end_date: new Date('2026-03-10'),
      },
    });

    console.log('Created policies:', { policy1, policy2, policy3 });

    // Create medical history
    const medicalHistory1 = await prisma.medicalHistory.create({
      data: {
        user_id: user1.id,
        condition: 'Hypertension',
        diagnosis_date: new Date('2023-05-15'),
        treatment: 'Medication, lifestyle changes',
      },
    });

    const medicalHistory2 = await prisma.medicalHistory.create({
      data: {
        user_id: user2.id,
        condition: 'Asthma',
        diagnosis_date: new Date('2022-03-10'),
        treatment: 'Inhaler, avoid triggers',
      },
    });

    const medicalHistory3 = await prisma.medicalHistory.create({
      data: {
        user_id: user3.id,
        condition: 'Type 2 Diabetes',
        diagnosis_date: new Date('2021-11-20'),
        treatment: 'Insulin, diet management',
      },
    });

    console.log('Created medical histories:', { medicalHistory1, medicalHistory2, medicalHistory3 });

    // Create claims
    const claim1 = await prisma.claim.create({
      data: {
        user_id: user1.id,
        policy_id: policy1.id,
        treatment: 'Emergency Appendectomy',
        treatment_date: new Date('2025-04-10'),
        cause: 'Acute Appendicitis',
        status: 'Pending',
      },
    });

    const claim2 = await prisma.claim.create({
      data: {
        user_id: user2.id,
        policy_id: policy2.id,
        treatment: 'Dental Cleaning',
        treatment_date: new Date('2025-05-15'),
        cause: 'Routine Checkup',
        status: 'Approved',
      },
    });

    const claim3 = await prisma.claim.create({
      data: {
        user_id: user3.id,
        policy_id: policy3.id,
        treatment: 'Prenatal Care',
        treatment_date: new Date('2025-06-20'),
        cause: 'Pregnancy',
        status: 'Pending',
      },
    });

    console.log('Created claims:', { claim1, claim2, claim3 });

    // Create documents
    const document1 = await prisma.document.create({
      data: {
        claim_id: claim1.id,
        document_type: 'Medical Bill',
        file_path: '/uploads/bills/bill_123.pdf',
      },
    });

    const document2 = await prisma.document.create({
      data: {
        claim_id: claim1.id,
        document_type: 'Doctor Report',
        file_path: '/uploads/reports/report_456.pdf',
      },
    });

    const document3 = await prisma.document.create({
      data: {
        claim_id: claim2.id,
        document_type: 'Dental Invoice',
        file_path: '/uploads/invoices/invoice_789.pdf',
      },
    });

    const document4 = await prisma.document.create({
      data: {
        claim_id: claim3.id,
        document_type: 'Ultrasound Report',
        file_path: '/uploads/reports/ultrasound_101.pdf',
      },
    });

    console.log('Created documents:', { document1, document2, document3, document4 });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
