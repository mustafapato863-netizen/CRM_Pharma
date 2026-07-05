import { randomBytes, scryptSync } from "crypto";
import {
  Prisma,
  ProductType,
  PartyType,
  StockMovementType,
  LedgerEntryType,
  LedgerStatus,
  InvoiceType,
  InvoicePaymentStatus,
} from "@prisma/client";
import { prisma } from "../src/lib/prisma";

const permissions = [
  "dashboard",
  "products",
  "batchView",
  "batchCreate",
  "batchEdit",
  "batchDelete",
  "stock",
  "parties",
  "partiesExport",
  "stockInView",
  "stockInCreate",
  "stockOutView",
  "stockOutCreate",
  "ledger",
  "reports",
  "expiryAlerts",
  "users",
  "settings",
] as const;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64) as Buffer;
  return `scrypt$16384$8$1$${salt}$${derivedKey.toString("hex")}`;
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "admin@pharmacy.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME?.trim() || "أدمن النظام (Admin)";
  const adminPasswordHash = hashPassword(adminPassword);

  console.log("Cleaning existing database records...");
  
  // Clean tables in correct order
  await prisma.invoiceLine.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.ledgerEntry.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.party.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating default Admin user...");
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      permissions: permissions as unknown as Prisma.InputJsonValue,
      isActive: true,
    },
  });

  console.log("Seeding realistic Products...");
  const productData = [
    {
      code: "MED-001",
      name: "بنادول أدفانس 500 ملغ (Panadol Advance)",
      type: ProductType.MEDICINE,
      unit: "box",
    },
    {
      code: "MED-002",
      name: "أوجمنتين 1 غ (Augmentin 1g)",
      type: ProductType.MEDICINE,
      unit: "box",
    },
    {
      code: "MED-003",
      name: "ليبيتور 20 ملغ (Lipitor 20mg)",
      type: ProductType.MEDICINE,
      unit: "box",
    },
    {
      code: "MED-004",
      name: "فولتارين إيمولجل 100 غ (Voltaren)",
      type: ProductType.MEDICINE,
      unit: "tube",
    },
    {
      code: "MED-005",
      name: "بخاخ أوتريفين للبالغين (Otrivin)",
      type: ProductType.MEDICINE,
      unit: "bottle",
    },
    {
      code: "MED-006",
      name: "جوبيزون 5 ملغ (Gupisone 5mg)",
      type: ProductType.MEDICINE,
      unit: "box",
    },
    {
      code: "MED-007",
      name: "بروفين 400 ملغ (Brufen 400mg)",
      type: ProductType.MEDICINE,
      unit: "box",
    },
    {
      code: "FARM-001",
      name: "أعلاف حيوانية ممتازة 50 كغ (Premium Feed)",
      type: ProductType.FARM_SUPPLY,
      unit: "bag",
    },
    {
      code: "FARM-002",
      name: "بخاخ فيتيريسين للعناية بالجروح (Vetericyn)",
      type: ProductType.FARM_SUPPLY,
      unit: "bottle",
    },
  ];

  const products: Record<string, any> = {};
  for (const item of productData) {
    const p = await prisma.product.create({
      data: {
        code: item.code,
        name: item.name,
        searchName: normalizeName(item.name),
        type: item.type,
        unit: item.unit,
        isActive: true,
      },
    });
    products[item.code] = p;
  }

  console.log("Seeding realistic Parties (Suppliers & Customers)...");
  const partyData = [
    {
      code: "PAR-000001",
      name: "مستودع الأمل الطبي (Al-Amal Store)",
      nameEn: "Al-Amal Medical Store",
      type: PartyType.SUPPLIER,
      mobile: "0599111222",
      phone: "022987654",
      email: "info@alamalstore.com",
      address: "شارع القدس، رام الله",
      city: "رام الله",
      taxNumber: "900123456",
      commercialRegister: "CR-77665",
      notes: "المورد الرئيسي لبنادول وأوجمنتين",
      openingBalance: new Prisma.Decimal(5000.0), // Supplier credit balance (We owe them)
    },
    {
      code: "PAR-000002",
      name: "صيدلية الياسمين الحديثة (Al-Yasmin)",
      nameEn: "Al-Yasmin Modern Pharmacy",
      type: PartyType.CUSTOMER,
      mobile: "0599333444",
      phone: "022954321",
      email: "yasmin.pharmacy@outlook.com",
      address: "وسط البلد، نابلس",
      city: "نابلس",
      taxNumber: "900987654",
      commercialRegister: "CR-55443",
      notes: "عميل جملة دائم ونشط",
      openingBalance: new Prisma.Decimal(-1200.0), // Customer owes us (Debit)
    },
    {
      code: "PAR-000003",
      name: "شركة دواء الشرق للتجارة (East Pharma)",
      nameEn: "East Pharma Trading Company",
      type: PartyType.BOTH,
      mobile: "0599555666",
      phone: "022943210",
      email: "contact@eastpharma.ps",
      address: "المنطقة الصناعية، الخليل",
      city: "الخليل",
      taxNumber: "900456789",
      commercialRegister: "CR-99887",
      notes: "مورد وعميل للمنتجات الزراعية والطبية",
      openingBalance: new Prisma.Decimal(0.0),
    },
  ];

  const parties: Record<string, any> = {};
  for (const item of partyData) {
    const p = await prisma.party.create({
      data: {
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        searchName: normalizeName(`${item.name} ${item.nameEn}`),
        type: item.type,
        mobile: item.mobile,
        phone: item.phone,
        email: item.email,
        address: item.address,
        city: item.city,
        taxNumber: item.taxNumber,
        commercialRegister: item.commercialRegister,
        notes: item.notes,
        isActive: true,
        openingBalance: item.openingBalance,
      },
    });
    parties[item.code] = p;
  }

  console.log("Seeding Batches with varying expiry dates...");
  const dateExpired = new Date();
  dateExpired.setMonth(dateExpired.getMonth() - 3); // Expired 3 months ago

  const dateExpiringSoon = new Date();
  dateExpiringSoon.setDate(dateExpiringSoon.getDate() + 25); // Expiring in 25 days

  const dateHealthy = new Date();
  dateHealthy.setMonth(dateHealthy.getMonth() + 18); // 18 months expiry

  const dateHealthy2 = new Date();
  dateHealthy2.setMonth(dateHealthy2.getMonth() + 24); // 24 months expiry

  const batchData = [
    // Panadol
    {
      productId: products["MED-001"].id,
      batchNumber: "B-PAN-EXP01",
      expiryDate: dateExpired,
      purchaseCost: new Prisma.Decimal(12.5),
      openingQty: new Prisma.Decimal(10.0),
    },
    {
      productId: products["MED-001"].id,
      batchNumber: "B-PAN-SOON02",
      expiryDate: dateExpiringSoon,
      purchaseCost: new Prisma.Decimal(13.0),
      openingQty: new Prisma.Decimal(45.0),
    },
    {
      productId: products["MED-001"].id,
      batchNumber: "B-PAN-OK03",
      expiryDate: dateHealthy,
      purchaseCost: new Prisma.Decimal(13.0),
      openingQty: new Prisma.Decimal(250.0),
    },
    // Augmentin
    {
      productId: products["MED-002"].id,
      batchNumber: "B-AUG-SOON01",
      expiryDate: dateExpiringSoon,
      purchaseCost: new Prisma.Decimal(38.0),
      openingQty: new Prisma.Decimal(15.0),
    },
    {
      productId: products["MED-002"].id,
      batchNumber: "B-AUG-OK02",
      expiryDate: dateHealthy2,
      purchaseCost: new Prisma.Decimal(38.0),
      openingQty: new Prisma.Decimal(120.0),
    },
    // Lipitor
    {
      productId: products["MED-003"].id,
      batchNumber: "B-LIP-OK01",
      expiryDate: dateHealthy,
      purchaseCost: new Prisma.Decimal(75.0),
      openingQty: new Prisma.Decimal(60.0),
    },
    // Voltaren
    {
      productId: products["MED-004"].id,
      batchNumber: "B-VOL-OK01",
      expiryDate: dateHealthy2,
      purchaseCost: new Prisma.Decimal(18.5),
      openingQty: new Prisma.Decimal(80.0),
    },
    // Otrivin
    {
      productId: products["MED-005"].id,
      batchNumber: "B-OTR-LOW01",
      expiryDate: dateExpiringSoon,
      purchaseCost: new Prisma.Decimal(11.0),
      openingQty: new Prisma.Decimal(2.0), // Low stock
    },
    // Gupisone
    {
      productId: products["MED-006"].id,
      batchNumber: "B-GUP-OK01",
      expiryDate: dateHealthy,
      purchaseCost: new Prisma.Decimal(6.0),
      openingQty: new Prisma.Decimal(400.0),
    },
    // Brufen
    {
      productId: products["MED-007"].id,
      batchNumber: "B-BRF-OK01",
      expiryDate: dateHealthy2,
      purchaseCost: new Prisma.Decimal(9.0),
      openingQty: new Prisma.Decimal(150.0),
    },
    // Animal Feed
    {
      productId: products["FARM-001"].id,
      batchNumber: "B-FED-OK01",
      expiryDate: dateHealthy,
      purchaseCost: new Prisma.Decimal(90.0),
      openingQty: new Prisma.Decimal(35.0),
    },
  ];

  const batches: Record<string, any> = {};
  for (const b of batchData) {
    const batch = await prisma.batch.create({
      data: {
        productId: b.productId,
        batchNumber: b.batchNumber,
        expiryDate: b.expiryDate,
        purchaseCost: b.purchaseCost,
        openingQty: b.openingQty,
      },
    });
    batches[b.batchNumber] = batch;
  }

  console.log("Seeding historical Invoices & Invoices Lines...");
  // 1. Sales Invoice to Al-Yasmin Modern Pharmacy
  const salesInvoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "SAL-2026-0001",
      type: InvoiceType.SALES,
      partyId: parties["PAR-000002"].id,
      createdById: admin.id,
      paymentStatus: InvoicePaymentStatus.PAID,
      invoiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      reference: "ORDER-9912",
      notes: "الطلبية الدورية المدفوعة نقداً",
      subtotal: new Prisma.Decimal(825.0),
      taxTotal: new Prisma.Decimal(82.5),
      grandTotal: new Prisma.Decimal(907.5),
      paidAmount: new Prisma.Decimal(907.5),
      remainingAmount: new Prisma.Decimal(0.0),
    },
  });

  await prisma.invoiceLine.createMany({
    data: [
      {
        invoiceId: salesInvoice1.id,
        productId: products["MED-001"].id,
        batchId: batches["B-PAN-OK03"].id,
        expiryDate: dateHealthy,
        unit: "box",
        quantity: new Prisma.Decimal(30.0),
        unitPrice: new Prisma.Decimal(17.5),
        lineTotal: new Prisma.Decimal(525.0),
      },
      {
        invoiceId: salesInvoice1.id,
        productId: products["MED-002"].id,
        batchId: batches["B-AUG-OK02"].id,
        expiryDate: dateHealthy2,
        unit: "box",
        quantity: new Prisma.Decimal(6.0),
        unitPrice: new Prisma.Decimal(50.0),
        lineTotal: new Prisma.Decimal(300.0),
      },
    ],
  });

  // Create corresponding STOCK_OUT movements for salesInvoice1
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products["MED-001"].id,
        batchId: batches["B-PAN-OK03"].id,
        partyId: parties["PAR-000002"].id,
        userId: admin.id,
        type: StockMovementType.STOCK_OUT,
        quantity: new Prisma.Decimal(30.0),
        reference: salesInvoice1.invoiceNumber,
        reason: "مبيعات فاتورة رقم SAL-2026-0001",
        movementAt: salesInvoice1.invoiceDate,
      },
      {
        productId: products["MED-002"].id,
        batchId: batches["B-AUG-OK02"].id,
        partyId: parties["PAR-000002"].id,
        userId: admin.id,
        type: StockMovementType.STOCK_OUT,
        quantity: new Prisma.Decimal(6.0),
        reference: salesInvoice1.invoiceNumber,
        reason: "مبيعات فاتورة رقم SAL-2026-0001",
        movementAt: salesInvoice1.invoiceDate,
      },
    ],
  });

  // 2. Sales Invoice (Unpaid) to East Pharma (BOTH)
  const salesInvoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "SAL-2026-0002",
      type: InvoiceType.SALES,
      partyId: parties["PAR-000003"].id,
      createdById: admin.id,
      paymentStatus: InvoicePaymentStatus.UNPAID,
      invoiceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      reference: "ORDER-9923",
      notes: "الذمم الآجلة المترتبة على الشركة الشرقية",
      subtotal: new Prisma.Decimal(1185.0),
      taxTotal: new Prisma.Decimal(118.5),
      grandTotal: new Prisma.Decimal(1303.5),
      paidAmount: new Prisma.Decimal(0.0),
      remainingAmount: new Prisma.Decimal(1303.5),
    },
  });

  await prisma.invoiceLine.createMany({
    data: [
      {
        invoiceId: salesInvoice2.id,
        productId: products["MED-003"].id,
        batchId: batches["B-LIP-OK01"].id,
        expiryDate: dateHealthy,
        unit: "box",
        quantity: new Prisma.Decimal(10.0),
        unitPrice: new Prisma.Decimal(95.0),
        lineTotal: new Prisma.Decimal(950.0),
      },
      {
        invoiceId: salesInvoice2.id,
        productId: products["MED-004"].id,
        batchId: batches["B-VOL-OK01"].id,
        expiryDate: dateHealthy2,
        unit: "tube",
        quantity: new Prisma.Decimal(10.0),
        unitPrice: new Prisma.Decimal(23.5),
        lineTotal: new Prisma.Decimal(235.0),
      },
    ],
  });

  // Create corresponding STOCK_OUT movements for salesInvoice2
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products["MED-003"].id,
        batchId: batches["B-LIP-OK01"].id,
        partyId: parties["PAR-000003"].id,
        userId: admin.id,
        type: StockMovementType.STOCK_OUT,
        quantity: new Prisma.Decimal(10.0),
        reference: salesInvoice2.invoiceNumber,
        reason: "مبيعات فاتورة رقم SAL-2026-0002",
        movementAt: salesInvoice2.invoiceDate,
      },
      {
        productId: products["MED-004"].id,
        batchId: batches["B-VOL-OK01"].id,
        partyId: parties["PAR-000003"].id,
        userId: admin.id,
        type: StockMovementType.STOCK_OUT,
        quantity: new Prisma.Decimal(10.0),
        reference: salesInvoice2.invoiceNumber,
        reason: "مبيعات فاتورة رقم SAL-2026-0002",
        movementAt: salesInvoice2.invoiceDate,
      },
    ],
  });

  // 3. Purchase Invoice (Partial) from Al-Amal Store (SUPPLIER)
  const purchaseInvoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "PUR-2026-0001",
      type: InvoiceType.PURCHASE,
      partyId: parties["PAR-000001"].id,
      createdById: admin.id,
      paymentStatus: InvoicePaymentStatus.PARTIAL,
      invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      reference: "SHIP-110",
      notes: "دفعة جديدة من مستودع الأمل تم سداد جزء منها",
      subtotal: new Prisma.Decimal(2680.0),
      taxTotal: new Prisma.Decimal(268.0),
      grandTotal: new Prisma.Decimal(2948.0),
      paidAmount: new Prisma.Decimal(1000.0),
      remainingAmount: new Prisma.Decimal(1948.0),
    },
  });

  await prisma.invoiceLine.createMany({
    data: [
      {
        invoiceId: purchaseInvoice1.id,
        productId: products["MED-001"].id,
        batchId: batches["B-PAN-OK03"].id,
        expiryDate: dateHealthy,
        unit: "box",
        quantity: new Prisma.Decimal(100.0),
        unitPrice: new Prisma.Decimal(13.0),
        lineTotal: new Prisma.Decimal(1300.0),
      },
      {
        invoiceId: purchaseInvoice1.id,
        productId: products["MED-002"].id,
        batchId: batches["B-AUG-OK02"].id,
        expiryDate: dateHealthy2,
        unit: "box",
        quantity: new Prisma.Decimal(30.0),
        unitPrice: new Prisma.Decimal(38.0),
        lineTotal: new Prisma.Decimal(1140.0),
      },
      {
        invoiceId: purchaseInvoice1.id,
        productId: products["MED-005"].id,
        batchId: batches["B-OTR-LOW01"].id,
        expiryDate: dateExpiringSoon,
        unit: "bottle",
        quantity: new Prisma.Decimal(20.0),
        unitPrice: new Prisma.Decimal(12.0),
        lineTotal: new Prisma.Decimal(240.0),
      },
    ],
  });

  // Create corresponding STOCK_IN movements for purchaseInvoice1
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products["MED-001"].id,
        batchId: batches["B-PAN-OK03"].id,
        partyId: parties["PAR-000001"].id,
        userId: admin.id,
        type: StockMovementType.STOCK_IN,
        quantity: new Prisma.Decimal(100.0),
        reference: purchaseInvoice1.invoiceNumber,
        reason: "مشتريات فاتورة رقم PUR-2026-0001",
        movementAt: purchaseInvoice1.invoiceDate,
      },
      {
        productId: products["MED-002"].id,
        batchId: batches["B-AUG-OK02"].id,
        partyId: parties["PAR-000001"].id,
        userId: admin.id,
        type: StockMovementType.STOCK_IN,
        quantity: new Prisma.Decimal(30.0),
        reference: purchaseInvoice1.invoiceNumber,
        reason: "مشتريات فاتورة رقم PUR-2026-0001",
        movementAt: purchaseInvoice1.invoiceDate,
      },
      {
        productId: products["MED-005"].id,
        batchId: batches["B-OTR-LOW01"].id,
        partyId: parties["PAR-000001"].id,
        userId: admin.id,
        type: StockMovementType.STOCK_IN,
        quantity: new Prisma.Decimal(20.0),
        reference: purchaseInvoice1.invoiceNumber,
        reason: "مشتريات فاتورة رقم PUR-2026-0001",
        movementAt: purchaseInvoice1.invoiceDate,
      },
    ],
  });

  console.log("Seeding Ledger entries...");
  await prisma.ledgerEntry.createMany({
    data: [
      {
        partyId: parties["PAR-000001"].id,
        userId: admin.id,
        type: LedgerEntryType.SUPPLIER_BALANCE,
        status: LedgerStatus.PARTIAL,
        amount: new Prisma.Decimal(2948.0),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Due in 15 days
        notes: "فاتورة مشتريات رقم PUR-2026-0001",
      },
      {
        partyId: parties["PAR-000003"].id,
        userId: admin.id,
        type: LedgerEntryType.CUSTOMER_BALANCE,
        status: LedgerStatus.PENDING,
        amount: new Prisma.Decimal(1303.5),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        notes: "فاتورة مبيعات رقم SAL-2026-0002",
      },
    ],
  });

  console.log("Seeding Damaged item stock movements...");
  // Seeding 1 damaged movement
  await prisma.stockMovement.create({
    data: {
      productId: products["MED-001"].id,
      batchId: batches["B-PAN-EXP01"].id,
      userId: admin.id,
      type: StockMovementType.DAMAGED,
      quantity: new Prisma.Decimal(5.0),
      reason: "تلف عبوات بسبب سوء التخزين والرطوبة",
      reference: "DMG-101",
      movementAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const batchCount = await prisma.batch.count();
  const partyCount = await prisma.party.count();
  const movementCount = await prisma.stockMovement.count();
  const invoiceCount = await prisma.invoice.count();

  console.log("-----------------------------------------");
  console.log("Seed complete successfully!");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
  console.log(`Users seeded: ${userCount}`);
  console.log(`Products seeded: ${productCount}`);
  console.log(`Batches seeded: ${batchCount}`);
  console.log(`Parties seeded: ${partyCount}`);
  console.log(`Invoices seeded: ${invoiceCount}`);
  console.log(`Movements seeded: ${movementCount}`);
  console.log("-----------------------------------------");
}

main()
  .catch((error) => {
    console.error("Error occurred during seeding:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
