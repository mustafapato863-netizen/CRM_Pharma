export type FAQItem = {
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  category: string;
};

export const SYSTEM_FAQ: FAQItem[] = [
  {
    category: "products",
    question: "How to add a new product?",
    questionAr: "كيف يمكنني إضافة منتج جديد؟",
    answer: "To add a new product:\n1. Go to **Products** in the sidebar.\n2. Click the **Add Product** button in the header.\n3. Fill in the product details (Code, Name, Category: Medicine or Farm Supply, Unit).\n4. Click **Save Product**.\n*Note: To add stock quantities, you must record a Purchase Invoice under Purchases.*",
    answerAr: "لإضافة منتج جديد:\n1. اذهب إلى صفحة **المنتجات (Products)** من القائمة الجانبية.\n2. انقر على زر **إضافة منتج (Add)** في أعلى الصفحة.\n3. أدخل تفاصيل المنتج (الكود، الاسم العلمي/التجاري، القسم: أدوية أو مستلزمات زراعية، والوحدة).\n4. انقر على **حفظ (Save)**.\n*ملاحظة: لإدخال كميات المخزون وتواريخ الصلاحية، يجب تسجيل فاتورة مشتريات من صفحة المشتريات.*"
  },
  {
    category: "invoices",
    question: "How to record a Sales Invoice?",
    questionAr: "كيف أقوم بتسجيل فاتورة مبيعات؟",
    answer: "To record a sales invoice:\n1. Go to **Sales** > **Sales Invoices**.\n2. Select the customer from the dropdown. (It will load their phone, email, and loyalty points).\n3. Use the search bar to find products or scan barcodes.\n4. For each product, select the active Batch (displays expiry date and available stock).\n5. Enter the quantity and unit price/discount.\n6. Enter the **Amount Received** at the bottom.\n7. Click **Complete Sale**. This will deduct stock, record the transaction, and update the customer's balance if unpaid.",
    answerAr: "لتسجيل فاتورة مبيعات جديدة:\n1. اذهب إلى **المبيعات (Sales)** > **فواتير المبيعات (Sales Invoices)**.\n2. اختر العميل من القائمة (سيتم جلب هاتفه ونقاط ولائه تلقائياً).\n3. استخدم شريط البحث للعثور على المنتجات أو مسح باركود الدواء.\n4. لكل منتج مضاف، اختر رقم التشغيلة (Batch) لرؤية تاريخ صلاحيتها والكمية المتوفرة.\n5. أدخل الكمية المباعة والخصم إن وجد.\n6. أدخل **المبلغ المستلم (Amount Received)** في الأسفل لتحديد الباقي.\n7. انقر على **إكمال عملية البيع (Complete Sale)** لحفظ الفاتورة وتحديث المخزن والحسابات."
  },
  {
    category: "profit",
    question: "How is Estimated Profit calculated?",
    questionAr: "كيف يتم احتساب الأرباح التقديرية؟",
    answer: "Estimated Profit is calculated dynamically for each Sales Invoice:\n* **Formula**: `Profit = (Line Total Excl. Tax) - (Quantity × Batch Purchase Cost)`\n* **Margin**: `Profit Margin % = (Profit / Line Total Excl. Tax) × 100`\nThis allows pharmacists to see their net earnings in real-time based on the exact purchase cost of the batch being sold.",
    answerAr: "يتم احتساب الأرباح التقديرية ديناميكياً في فاتورة المبيعات كالتالي:\n* **المعادلة**: `الربح = (إجمالي السطر بدون ضريبة) - (الكمية المباعة × تكلفة شراء التشغيلة)`\n* **هامش الربح**: `نسبة الهامش = (الربح / إجمالي السطر بدون ضريبة) × 100`\nهذا يتيح للصيدلاني معرفة صافي أرباحه فوراً بناءً على سعر تكلفة الشراء الفعلي للتشغيلة المباعة."
  },
  {
    category: "expiry",
    question: "How to handle Expiring/Expired medicines?",
    questionAr: "كيف أتعامل مع الأدوية المنتهية أو القريبة للانتهاء؟",
    answer: "The system provides an automated **Expiry Alerts** tracker:\n1. Go to **Expiry Alerts** in the sidebar.\n2. View expired items (Red) and items expiring soon (Orange).\n3. Click on any item to view its supplier and purchase invoice details.\n4. You can contact the supplier to return soon-to-expire batches or record a **Damaged/Adjustment** stock movement to write off expired inventory.",
    answerAr: "يوفر النظام متتبعاً تلقائياً في صفحة **تنبيهات الصلاحية (Expiry Alerts)**:\n1. اذهب لصفحة **تنبيهات الصلاحية** من القائمة الجانبية.\n2. استعرض الأدوية منتهية الصلاحية (باللون الأحمر) والقريبة للانتهاء (باللون البرتقالي).\n3. انقر على أي دواء لفتح تفاصيله ومعرفة المورد وفاتورة الشراء الأصلية.\n4. يمكنك التواصل مع المورد لإرجاع الباتشات القريبة، أو تسجيل حركة مخزون **تالف (Damaged)** لإعدام وشطب الأدوية التالفة."
  },
  {
    category: "balances",
    question: "How to check Supplier & Customer balances?",
    questionAr: "كيف أتحقق من أرصدة العملاء والموردين؟",
    answer: "To check financial balances:\n1. Go to **Ledger** or **Payments**.\n2. In **Payments**, select a customer or supplier. The system will instantly show their current balance type:\n   * **Receivable**: Owed by the customer to the pharmacy.\n   * **Payable**: Owed by the pharmacy to the supplier.\n   * **Settled**: Zero balance.\n3. You can record a payment (Receipt from customer / Payment to supplier) to settle balances.",
    answerAr: "للتحقق من الأرصدة والمديونيات:\n1. اذهب لصفحة **الحسابات (Ledger)** أو **مركز المدفوعات (Payments)**.\n2. في صفحة **المدفوعات**، عند اختيار أي عميل أو مورد، سيعرض النظام فوراً رصيده الحالي ونوعه:\n   * **مستحق القبض (Receivable)**: ديون على العميل لصالح الصيدلية.\n   * **مستحق الدفع (Payable)**: ديون على الصيدلية لصالح المورد.\n   * **مسوى (Settled)**: رصيد صفر.\n3. يمكنك تسجيل دفعة (سند قبض من عميل / سند صرف لمورد) لتسوية الحسابات."
  }
];
