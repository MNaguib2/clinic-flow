-- Rename the page catalog while preserving its stable keys.
RENAME TABLE `pages` TO `permission_pages`;

ALTER TABLE `permission_pages`
    DROP INDEX `pages_name_key`,
    CHANGE COLUMN `name` `key` VARCHAR(150) NOT NULL,
    ADD COLUMN `name_en` VARCHAR(150) NULL,
    ADD COLUMN `name_ar` VARCHAR(150) NULL,
    ADD UNIQUE INDEX `permission_pages_key_key`(`key`);

UPDATE `permission_pages`
SET
    `name_en` = CASE `key`
        WHEN 'organization' THEN 'Organization'
        WHEN 'clinic' THEN 'Clinics'
        WHEN 'user' THEN 'Users'
        WHEN 'role' THEN 'Roles'
        WHEN 'permission' THEN 'Permissions'
        WHEN 'specialty' THEN 'Specialties'
        WHEN 'patient_account' THEN 'Patient accounts'
        WHEN 'patient_record' THEN 'Patient records'
        WHEN 'patient_share' THEN 'Patient sharing'
        WHEN 'medical_case' THEN 'Medical cases'
        WHEN 'appointment' THEN 'Appointments'
        WHEN 'visit' THEN 'Visits'
        WHEN 'diagnosis' THEN 'Diagnoses'
        WHEN 'prescription' THEN 'Prescriptions'
        WHEN 'medical_request' THEN 'Medical requests'
        WHEN 'attachment' THEN 'Attachments'
        WHEN 'unit_category' THEN 'Unit categories'
        WHEN 'unit' THEN 'Units'
        WHEN 'product' THEN 'Products'
        WHEN 'product_unit' THEN 'Product units'
        WHEN 'service' THEN 'Services'
        WHEN 'inventory' THEN 'Inventory'
        WHEN 'inventory_transaction' THEN 'Inventory transactions'
        WHEN 'invoice' THEN 'Invoices'
        WHEN 'invoice_item' THEN 'Invoice items'
        WHEN 'payment' THEN 'Payments'
        WHEN 'expense_category' THEN 'Expense categories'
        WHEN 'expense' THEN 'Expenses'
        WHEN 'recurring_expense' THEN 'Recurring expenses'
        WHEN 'login_session' THEN 'Login sessions'
        WHEN 'audit_log' THEN 'Audit log'
        ELSE `key`
    END,
    `name_ar` = CASE `key`
        WHEN 'organization' THEN 'المؤسسة'
        WHEN 'clinic' THEN 'العيادات'
        WHEN 'user' THEN 'المستخدمون'
        WHEN 'role' THEN 'الأدوار'
        WHEN 'permission' THEN 'الصلاحيات'
        WHEN 'specialty' THEN 'التخصصات'
        WHEN 'patient_account' THEN 'حسابات المرضى'
        WHEN 'patient_record' THEN 'سجلات المرضى'
        WHEN 'patient_share' THEN 'مشاركة المرضى'
        WHEN 'medical_case' THEN 'الحالات الطبية'
        WHEN 'appointment' THEN 'المواعيد'
        WHEN 'visit' THEN 'الزيارات'
        WHEN 'diagnosis' THEN 'التشخيصات'
        WHEN 'prescription' THEN 'الوصفات الطبية'
        WHEN 'medical_request' THEN 'الطلبات الطبية'
        WHEN 'attachment' THEN 'المرفقات'
        WHEN 'unit_category' THEN 'فئات الوحدات'
        WHEN 'unit' THEN 'الوحدات'
        WHEN 'product' THEN 'المنتجات'
        WHEN 'product_unit' THEN 'وحدات المنتجات'
        WHEN 'service' THEN 'الخدمات'
        WHEN 'inventory' THEN 'المخزون'
        WHEN 'inventory_transaction' THEN 'حركات المخزون'
        WHEN 'invoice' THEN 'الفواتير'
        WHEN 'invoice_item' THEN 'بنود الفواتير'
        WHEN 'payment' THEN 'المدفوعات'
        WHEN 'expense_category' THEN 'فئات المصروفات'
        WHEN 'expense' THEN 'المصروفات'
        WHEN 'recurring_expense' THEN 'المصروفات المتكررة'
        WHEN 'login_session' THEN 'جلسات الدخول'
        WHEN 'audit_log' THEN 'سجل التدقيق'
        ELSE `key`
    END;

ALTER TABLE `permission_pages`
    MODIFY COLUMN `name_en` VARCHAR(150) NOT NULL,
    MODIFY COLUMN `name_ar` VARCHAR(150) NOT NULL;

-- Keep permission codes stable for authorization and idempotent seed updates.
ALTER TABLE `permissions`
    DROP INDEX `permissions_name_key`,
    CHANGE COLUMN `name` `code` VARCHAR(150) NOT NULL,
    ADD COLUMN `name_en` VARCHAR(150) NULL,
    ADD COLUMN `name_ar` VARCHAR(150) NULL,
    ADD UNIQUE INDEX `permissions_code_key`(`code`);

UPDATE `permissions`
SET
    `name_en` = LEFT(COALESCE(`description_en`, `code`), 150),
    `name_ar` = LEFT(COALESCE(`description_ar`, `code`), 150);

ALTER TABLE `permissions`
    MODIFY COLUMN `name_en` VARCHAR(150) NOT NULL,
    MODIFY COLUMN `name_ar` VARCHAR(150) NOT NULL;