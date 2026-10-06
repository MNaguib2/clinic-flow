/*
  Warnings:

  - You are about to drop the column `appointmentAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `bookingType` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `clinicId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `followUpNumber` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `medicalCaseId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientRecordId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `priceType` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(22))` to `VarChar(30)`.
  - You are about to drop the column `createdAt` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `storageKey` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `visitId` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `clinicId` on the `clinic_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `clinic_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `clinic_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `clinic_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `clinic_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `clinic_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `clinic_schedules` table. All the data in the column will be lost.
  - The primary key for the `clinic_specialties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clinicId` on the `clinic_specialties` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `clinic_specialties` table. All the data in the column will be lost.
  - You are about to drop the column `specialtyId` on the `clinic_specialties` table. All the data in the column will be lost.
  - The primary key for the `clinic_users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clinicId` on the `clinic_users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `clinic_users` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `clinic_users` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `clinics` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `clinics` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(150)`.
  - You are about to alter the column `phone` on the `clinics` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - You are about to drop the column `createdAt` on the `diagnoses` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `diagnoses` table. All the data in the column will be lost.
  - You are about to drop the column `visitId` on the `diagnoses` table. All the data in the column will be lost.
  - You are about to drop the column `clinicId` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `slotDurationMinutes` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `doctor_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `doctor_schedules` table. All the data in the column will be lost.
  - The primary key for the `doctor_specialties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `doctor_specialties` table. All the data in the column will be lost.
  - You are about to drop the column `specialtyId` on the `doctor_specialties` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `doctor_specialties` table. All the data in the column will be lost.
  - You are about to drop the column `baseQuantity` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `clinicId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `baseQuantity` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `clinicId` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `conversionFactorSnapshot` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceItemId` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `productUnitId` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transactionType` on the `inventory_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `baseQuantity` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `conversionFactorSnapshot` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceId` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `itemNameSnapshot` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `productUnitId` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePriceSnapshot` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `unitNameSnapshot` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `clinicId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceDate` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNumber` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `patientRecordId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `invoices` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(11))` to `VarChar(30)`.
  - You are about to drop the column `closedAt` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `patientRecordId` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `medical_cases` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(12))` to `VarChar(20)`.
  - You are about to drop the column `createdAt` on the `medical_requests` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `medical_requests` table. All the data in the column will be lost.
  - You are about to drop the column `requestType` on the `medical_requests` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `medical_requests` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `medical_requests` table. All the data in the column will be lost.
  - You are about to drop the column `visitId` on the `medical_requests` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `medical_requests` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(13))` to `VarChar(30)`.
  - The primary key for the `organization_appointment_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `organization_appointment_settings` table. All the data in the column will be lost.
  - You are about to drop the column `discountedFollowUpCount` on the `organization_appointment_settings` table. All the data in the column will be lost.
  - You are about to drop the column `examinationPrice` on the `organization_appointment_settings` table. All the data in the column will be lost.
  - You are about to drop the column `followUpPeriodDays` on the `organization_appointment_settings` table. All the data in the column will be lost.
  - You are about to drop the column `followUpPrice` on the `organization_appointment_settings` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `organization_appointment_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `organization_appointment_settings` table. All the data in the column will be lost.
  - The primary key for the `organization_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `organization_settings` table. All the data in the column will be lost.
  - You are about to drop the column `currencyCode` on the `organization_settings` table. All the data in the column will be lost.
  - You are about to drop the column `inventoryEnabled` on the `organization_settings` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `organization_settings` table. All the data in the column will be lost.
  - You are about to drop the column `unitConversionEnabled` on the `organization_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `organization_settings` table. All the data in the column will be lost.
  - The primary key for the `organizations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `organizations` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `organizations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(150)`.
  - The primary key for the `patient_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `patient_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `patient_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `patient_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `patient_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `nationalId` on the `patient_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `patient_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `patient_accounts` table. All the data in the column will be lost.
  - You are about to alter the column `gender` on the `patient_accounts` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(7))` to `VarChar(20)`.
  - You are about to drop the column `address` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `patientAccountId` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `patient_records` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `patient_shares` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `patient_shares` table. All the data in the column will be lost.
  - You are about to drop the column `patientAccountId` on the `patient_shares` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `patient_shares` table. All the data in the column will be lost.
  - You are about to drop the column `sourceOrganizationId` on the `patient_shares` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `patient_shares` table. All the data in the column will be lost.
  - You are about to drop the column `targetOrganizationId` on the `patient_shares` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `permissions` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `permissions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(150)`.
  - You are about to drop the column `createdAt` on the `prescription_items` table. All the data in the column will be lost.
  - You are about to drop the column `medicationName` on the `prescription_items` table. All the data in the column will be lost.
  - You are about to drop the column `prescriptionId` on the `prescription_items` table. All the data in the column will be lost.
  - You are about to alter the column `dosage` on the `prescription_items` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `frequency` on the `prescription_items` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `duration` on the `prescription_items` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to drop the column `createdAt` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `visitId` on the `prescriptions` table. All the data in the column will be lost.
  - The primary key for the `product_unit_role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `product_unit_role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `productUnitId` on the `product_unit_role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `product_unit_role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `factorToBase` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `isPurchaseUnit` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `isSaleUnit` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `unitCategoryId` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `product_units` table. All the data in the column will be lost.
  - You are about to drop the column `basePurchasePrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `baseSalePrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(200)`.
  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `rememberMe` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `tokenHash` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `refresh_tokens` table. All the data in the column will be lost.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `permissionId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `services` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `services` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(200)`.
  - You are about to drop the column `createdAt` on the `specialties` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `specialties` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `unit_categories` table. All the data in the column will be lost.
  - You are about to drop the column `defaultUnitId` on the `unit_categories` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `unit_categories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `unitCategoryId` on the `units` table. All the data in the column will be lost.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_roles` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentId` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `complaints` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosisSummary` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `examination` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `medicalCaseId` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `patientRecordId` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `visitAt` on the `visits` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,id]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clinic_id,product_id]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,invoice_number]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,patient_account_id]` on the table `patient_records` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,id]` on the table `patient_records` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_id,unit_id]` on the table `product_units` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_hash]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,id]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[unit_category_id,name]` on the table `units` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[unit_category_id,id]` on the table `units` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appointment_id]` on the table `visits` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointment_at` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `booking_type` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctor_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_record_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_type` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `clinic_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day_of_week` to the `clinic_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `clinic_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `clinic_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `clinic_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `clinic_specialties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialty_id` to the `clinic_specialties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `clinic_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `clinic_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visit_id` to the `diagnoses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day_of_week` to the `doctor_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `doctor_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `doctor_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `doctor_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `doctor_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialty_id` to the `doctor_specialties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `doctor_specialties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventory_id` to the `inventory_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity_in_base` to the `inventory_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_type` to the `inventory_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_id` to the `invoice_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_name` to the `invoice_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_number` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `medical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_record_id` to the `medical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `request_type` to the `medical_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medical_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visit_id` to the `medical_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `organization_appointment_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `organization_appointment_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `organization_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `organization_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `patient_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `patient_accounts` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `patient_accounts` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organization_id` to the `patient_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_account_id` to the `patient_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `patient_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from_organization_id` to the `patient_shares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_account_id` to the `patient_shares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_organization_id` to the `patient_shares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medication_name` to the `prescription_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prescription_id` to the `prescription_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visit_id` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_unit_id` to the `product_unit_role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `product_unit_role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_id` to the `product_units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `product_units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_hash` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permission_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `unit_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_category_id` to the `units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `appointment_id` to the `visits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctor_id` to the `visits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `visits` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_doctorId_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_medicalCaseId_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_patientRecordId_fkey`;

-- DropForeignKey
ALTER TABLE `attachments` DROP FOREIGN KEY `attachments_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `attachments` DROP FOREIGN KEY `attachments_visitId_fkey`;

-- DropForeignKey
ALTER TABLE `clinic_schedules` DROP FOREIGN KEY `clinic_schedules_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `clinic_schedules` DROP FOREIGN KEY `clinic_schedules_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `clinic_specialties` DROP FOREIGN KEY `clinic_specialties_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `clinic_specialties` DROP FOREIGN KEY `clinic_specialties_specialtyId_fkey`;

-- DropForeignKey
ALTER TABLE `clinic_users` DROP FOREIGN KEY `clinic_users_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `clinic_users` DROP FOREIGN KEY `clinic_users_userId_fkey`;

-- DropForeignKey
ALTER TABLE `clinics` DROP FOREIGN KEY `clinics_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `diagnoses` DROP FOREIGN KEY `diagnoses_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `diagnoses` DROP FOREIGN KEY `diagnoses_visitId_fkey`;

-- DropForeignKey
ALTER TABLE `doctor_schedules` DROP FOREIGN KEY `doctor_schedules_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `doctor_schedules` DROP FOREIGN KEY `doctor_schedules_doctorId_fkey`;

-- DropForeignKey
ALTER TABLE `doctor_schedules` DROP FOREIGN KEY `doctor_schedules_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `doctor_specialties` DROP FOREIGN KEY `doctor_specialties_specialtyId_fkey`;

-- DropForeignKey
ALTER TABLE `doctor_specialties` DROP FOREIGN KEY `doctor_specialties_userId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_productId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_transactions` DROP FOREIGN KEY `inventory_transactions_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_transactions` DROP FOREIGN KEY `inventory_transactions_invoiceItemId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_transactions` DROP FOREIGN KEY `inventory_transactions_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_transactions` DROP FOREIGN KEY `inventory_transactions_productId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_transactions` DROP FOREIGN KEY `inventory_transactions_productUnitId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice_items` DROP FOREIGN KEY `invoice_items_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice_items` DROP FOREIGN KEY `invoice_items_productId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice_items` DROP FOREIGN KEY `invoice_items_productUnitId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice_items` DROP FOREIGN KEY `invoice_items_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `invoices_clinicId_fkey`;

-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `invoices_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `invoices_patientRecordId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_cases` DROP FOREIGN KEY `medical_cases_doctorId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_cases` DROP FOREIGN KEY `medical_cases_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_cases` DROP FOREIGN KEY `medical_cases_patientRecordId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_requests` DROP FOREIGN KEY `medical_requests_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_requests` DROP FOREIGN KEY `medical_requests_visitId_fkey`;

-- DropForeignKey
ALTER TABLE `organization_appointment_settings` DROP FOREIGN KEY `organization_appointment_settings_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `organization_settings` DROP FOREIGN KEY `organization_settings_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `patient_records` DROP FOREIGN KEY `patient_records_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `patient_records` DROP FOREIGN KEY `patient_records_patientAccountId_fkey`;

-- DropForeignKey
ALTER TABLE `patient_shares` DROP FOREIGN KEY `patient_shares_patientAccountId_fkey`;

-- DropForeignKey
ALTER TABLE `patient_shares` DROP FOREIGN KEY `patient_shares_sourceOrganizationId_fkey`;

-- DropForeignKey
ALTER TABLE `patient_shares` DROP FOREIGN KEY `patient_shares_targetOrganizationId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `prescription_items` DROP FOREIGN KEY `prescription_items_prescriptionId_fkey`;

-- DropForeignKey
ALTER TABLE `prescriptions` DROP FOREIGN KEY `prescriptions_doctorId_fkey`;

-- DropForeignKey
ALTER TABLE `prescriptions` DROP FOREIGN KEY `prescriptions_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `prescriptions` DROP FOREIGN KEY `prescriptions_visitId_fkey`;

-- DropForeignKey
ALTER TABLE `product_unit_role_permissions` DROP FOREIGN KEY `product_unit_role_permissions_productUnitId_fkey`;

-- DropForeignKey
ALTER TABLE `product_unit_role_permissions` DROP FOREIGN KEY `product_unit_role_permissions_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `product_units` DROP FOREIGN KEY `product_units_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `product_units` DROP FOREIGN KEY `product_units_productId_fkey`;

-- DropForeignKey
ALTER TABLE `product_units` DROP FOREIGN KEY `product_units_unitCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `product_units` DROP FOREIGN KEY `product_units_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_userId_fkey`;

-- DropForeignKey
ALTER TABLE `role_permissions` DROP FOREIGN KEY `role_permissions_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `role_permissions` DROP FOREIGN KEY `role_permissions_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `roles` DROP FOREIGN KEY `roles_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `services` DROP FOREIGN KEY `services_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `unit_categories` DROP FOREIGN KEY `unit_categories_defaultUnitId_fkey`;

-- DropForeignKey
ALTER TABLE `units` DROP FOREIGN KEY `units_unitCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_userId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `visits` DROP FOREIGN KEY `visits_appointmentId_fkey`;

-- DropForeignKey
ALTER TABLE `visits` DROP FOREIGN KEY `visits_doctorId_fkey`;

-- DropForeignKey
ALTER TABLE `visits` DROP FOREIGN KEY `visits_medicalCaseId_fkey`;

-- DropForeignKey
ALTER TABLE `visits` DROP FOREIGN KEY `visits_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `visits` DROP FOREIGN KEY `visits_patientRecordId_fkey`;

-- DropIndex
DROP INDEX `appointments_clinicId_appointmentAt_idx` ON `appointments`;

-- DropIndex
DROP INDEX `appointments_doctorId_appointmentAt_idx` ON `appointments`;

-- DropIndex
DROP INDEX `appointments_medicalCaseId_idx` ON `appointments`;

-- DropIndex
DROP INDEX `appointments_organizationId_appointmentAt_idx` ON `appointments`;

-- DropIndex
DROP INDEX `appointments_patientRecordId_idx` ON `appointments`;

-- DropIndex
DROP INDEX `attachments_organizationId_fkey` ON `attachments`;

-- DropIndex
DROP INDEX `attachments_visitId_idx` ON `attachments`;

-- DropIndex
DROP INDEX `clinic_schedules_clinicId_idx` ON `clinic_schedules`;

-- DropIndex
DROP INDEX `clinic_schedules_organizationId_idx` ON `clinic_schedules`;

-- DropIndex
DROP INDEX `clinic_specialties_specialtyId_idx` ON `clinic_specialties`;

-- DropIndex
DROP INDEX `clinic_users_userId_idx` ON `clinic_users`;

-- DropIndex
DROP INDEX `clinics_organizationId_code_key` ON `clinics`;

-- DropIndex
DROP INDEX `clinics_organizationId_idx` ON `clinics`;

-- DropIndex
DROP INDEX `clinics_organizationId_name_key` ON `clinics`;

-- DropIndex
DROP INDEX `diagnoses_organizationId_fkey` ON `diagnoses`;

-- DropIndex
DROP INDEX `diagnoses_visitId_idx` ON `diagnoses`;

-- DropIndex
DROP INDEX `doctor_schedules_clinicId_idx` ON `doctor_schedules`;

-- DropIndex
DROP INDEX `doctor_schedules_doctorId_idx` ON `doctor_schedules`;

-- DropIndex
DROP INDEX `doctor_schedules_organizationId_idx` ON `doctor_schedules`;

-- DropIndex
DROP INDEX `doctor_specialties_specialtyId_idx` ON `doctor_specialties`;

-- DropIndex
DROP INDEX `inventory_clinicId_productId_key` ON `inventory`;

-- DropIndex
DROP INDEX `inventory_organizationId_clinicId_idx` ON `inventory`;

-- DropIndex
DROP INDEX `inventory_productId_idx` ON `inventory`;

-- DropIndex
DROP INDEX `inventory_transactions_clinicId_idx` ON `inventory_transactions`;

-- DropIndex
DROP INDEX `inventory_transactions_invoiceItemId_idx` ON `inventory_transactions`;

-- DropIndex
DROP INDEX `inventory_transactions_organizationId_idx` ON `inventory_transactions`;

-- DropIndex
DROP INDEX `inventory_transactions_productId_idx` ON `inventory_transactions`;

-- DropIndex
DROP INDEX `inventory_transactions_productUnitId_fkey` ON `inventory_transactions`;

-- DropIndex
DROP INDEX `invoice_items_invoiceId_idx` ON `invoice_items`;

-- DropIndex
DROP INDEX `invoice_items_productId_idx` ON `invoice_items`;

-- DropIndex
DROP INDEX `invoice_items_productUnitId_idx` ON `invoice_items`;

-- DropIndex
DROP INDEX `invoice_items_serviceId_idx` ON `invoice_items`;

-- DropIndex
DROP INDEX `invoices_clinicId_invoiceDate_idx` ON `invoices`;

-- DropIndex
DROP INDEX `invoices_organizationId_invoiceDate_idx` ON `invoices`;

-- DropIndex
DROP INDEX `invoices_organizationId_invoiceNumber_key` ON `invoices`;

-- DropIndex
DROP INDEX `invoices_patientRecordId_idx` ON `invoices`;

-- DropIndex
DROP INDEX `medical_cases_doctorId_idx` ON `medical_cases`;

-- DropIndex
DROP INDEX `medical_cases_organizationId_idx` ON `medical_cases`;

-- DropIndex
DROP INDEX `medical_cases_patientRecordId_idx` ON `medical_cases`;

-- DropIndex
DROP INDEX `medical_requests_organizationId_fkey` ON `medical_requests`;

-- DropIndex
DROP INDEX `medical_requests_visitId_idx` ON `medical_requests`;

-- DropIndex
DROP INDEX `organizations_code_key` ON `organizations`;

-- DropIndex
DROP INDEX `organizations_status_idx` ON `organizations`;

-- DropIndex
DROP INDEX `patient_accounts_nationalId_idx` ON `patient_accounts`;

-- DropIndex
DROP INDEX `patient_records_organizationId_idx` ON `patient_records`;

-- DropIndex
DROP INDEX `patient_records_organizationId_patientAccountId_key` ON `patient_records`;

-- DropIndex
DROP INDEX `patient_records_patientAccountId_idx` ON `patient_records`;

-- DropIndex
DROP INDEX `patient_shares_patientAccountId_idx` ON `patient_shares`;

-- DropIndex
DROP INDEX `patient_shares_sourceOrganizationId_idx` ON `patient_shares`;

-- DropIndex
DROP INDEX `patient_shares_targetOrganizationId_idx` ON `patient_shares`;

-- DropIndex
DROP INDEX `payments_invoiceId_idx` ON `payments`;

-- DropIndex
DROP INDEX `payments_organizationId_paymentDate_idx` ON `payments`;

-- DropIndex
DROP INDEX `permissions_code_key` ON `permissions`;

-- DropIndex
DROP INDEX `prescription_items_prescriptionId_idx` ON `prescription_items`;

-- DropIndex
DROP INDEX `prescriptions_doctorId_idx` ON `prescriptions`;

-- DropIndex
DROP INDEX `prescriptions_organizationId_fkey` ON `prescriptions`;

-- DropIndex
DROP INDEX `prescriptions_visitId_idx` ON `prescriptions`;

-- DropIndex
DROP INDEX `product_unit_role_permissions_roleId_idx` ON `product_unit_role_permissions`;

-- DropIndex
DROP INDEX `product_units_organizationId_fkey` ON `product_units`;

-- DropIndex
DROP INDEX `product_units_productId_idx` ON `product_units`;

-- DropIndex
DROP INDEX `product_units_productId_unitId_key` ON `product_units`;

-- DropIndex
DROP INDEX `product_units_unitCategoryId_idx` ON `product_units`;

-- DropIndex
DROP INDEX `product_units_unitId_idx` ON `product_units`;

-- DropIndex
DROP INDEX `products_organizationId_idx` ON `products`;

-- DropIndex
DROP INDEX `products_organizationId_sku_key` ON `products`;

-- DropIndex
DROP INDEX `refresh_tokens_expiresAt_idx` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `refresh_tokens_tokenHash_key` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `refresh_tokens_userId_idx` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `role_permissions_permissionId_idx` ON `role_permissions`;

-- DropIndex
DROP INDEX `roles_organizationId_idx` ON `roles`;

-- DropIndex
DROP INDEX `roles_organizationId_name_key` ON `roles`;

-- DropIndex
DROP INDEX `services_organizationId_idx` ON `services`;

-- DropIndex
DROP INDEX `services_organizationId_name_key` ON `services`;

-- DropIndex
DROP INDEX `unit_categories_defaultUnitId_fkey` ON `unit_categories`;

-- DropIndex
DROP INDEX `units_unitCategoryId_idx` ON `units`;

-- DropIndex
DROP INDEX `units_unitCategoryId_name_key` ON `units`;

-- DropIndex
DROP INDEX `user_roles_roleId_idx` ON `user_roles`;

-- DropIndex
DROP INDEX `users_organizationId_email_key` ON `users`;

-- DropIndex
DROP INDEX `users_organizationId_idx` ON `users`;

-- DropIndex
DROP INDEX `users_phone_idx` ON `users`;

-- DropIndex
DROP INDEX `visits_appointmentId_idx` ON `visits`;

-- DropIndex
DROP INDEX `visits_doctorId_idx` ON `visits`;

-- DropIndex
DROP INDEX `visits_medicalCaseId_idx` ON `visits`;

-- DropIndex
DROP INDEX `visits_organizationId_fkey` ON `visits`;

-- DropIndex
DROP INDEX `visits_patientRecordId_idx` ON `visits`;

-- AlterTable
ALTER TABLE `appointments` DROP COLUMN `appointmentAt`,
    DROP COLUMN `bookingType`,
    DROP COLUMN `clinicId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `doctorId`,
    DROP COLUMN `followUpNumber`,
    DROP COLUMN `medicalCaseId`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `patientRecordId`,
    DROP COLUMN `priceType`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `appointment_at` DATETIME(6) NOT NULL,
    ADD COLUMN `booking_type` VARCHAR(20) NOT NULL,
    ADD COLUMN `clinic_id` BIGINT NOT NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `doctor_id` CHAR(36) NOT NULL,
    ADD COLUMN `follow_up_number` INTEGER NULL,
    ADD COLUMN `medical_case_id` BIGINT NULL,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `patient_record_id` BIGINT NOT NULL,
    ADD COLUMN `price_type` VARCHAR(30) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'scheduled';

-- AlterTable
ALTER TABLE `attachments` DROP COLUMN `createdAt`,
    DROP COLUMN `fileName`,
    DROP COLUMN `fileSize`,
    DROP COLUMN `mimeType`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `storageKey`,
    DROP COLUMN `visitId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `file_name` TEXT NOT NULL,
    ADD COLUMN `file_size` BIGINT NULL,
    ADD COLUMN `file_url` TEXT NOT NULL,
    ADD COLUMN `medical_request_id` BIGINT NULL,
    ADD COLUMN `mime_type` VARCHAR(100) NULL,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `patient_record_id` BIGINT NULL,
    ADD COLUMN `uploaded_by` CHAR(36) NULL,
    ADD COLUMN `visit_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `clinic_schedules` DROP COLUMN `clinicId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `dayOfWeek`,
    DROP COLUMN `endTime`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `startTime`,
    DROP COLUMN `status`,
    ADD COLUMN `clinic_id` BIGINT NOT NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `day_of_week` SMALLINT NOT NULL,
    ADD COLUMN `end_time` TIME(0) NOT NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `start_time` TIME(0) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL;

-- AlterTable
ALTER TABLE `clinic_specialties` DROP PRIMARY KEY,
    DROP COLUMN `clinicId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `specialtyId`,
    ADD COLUMN `clinic_id` BIGINT NOT NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `specialty_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`clinic_id`, `specialty_id`);

-- AlterTable
ALTER TABLE `clinic_users` DROP PRIMARY KEY,
    DROP COLUMN `clinicId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `clinic_id` BIGINT NOT NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `user_id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`clinic_id`, `user_id`);

-- AlterTable
ALTER TABLE `clinics` DROP COLUMN `code`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `name` VARCHAR(150) NOT NULL,
    MODIFY `phone` VARCHAR(30) NULL;

-- AlterTable
ALTER TABLE `diagnoses` DROP COLUMN `createdAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `visitId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `visit_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `doctor_schedules` DROP COLUMN `clinicId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `dayOfWeek`,
    DROP COLUMN `doctorId`,
    DROP COLUMN `endTime`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `slotDurationMinutes`,
    DROP COLUMN `startTime`,
    DROP COLUMN `status`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `day_of_week` SMALLINT NOT NULL,
    ADD COLUMN `end_time` TIME(0) NOT NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `start_time` TIME(0) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    ADD COLUMN `user_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `doctor_specialties` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `specialtyId`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `specialty_id` BIGINT NOT NULL,
    ADD COLUMN `user_id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `specialty_id`);

-- AlterTable
ALTER TABLE `inventory` DROP COLUMN `baseQuantity`,
    DROP COLUMN `clinicId`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `productId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `clinic_id` BIGINT NOT NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `product_id` BIGINT NOT NULL,
    ADD COLUMN `quantity` DECIMAL(18, 6) NOT NULL DEFAULT 0,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL;

-- AlterTable
ALTER TABLE `inventory_transactions` DROP COLUMN `baseQuantity`,
    DROP COLUMN `clinicId`,
    DROP COLUMN `conversionFactorSnapshot`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `invoiceItemId`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `productId`,
    DROP COLUMN `productUnitId`,
    DROP COLUMN `transactionType`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `created_by` CHAR(36) NULL,
    ADD COLUMN `inventory_id` BIGINT NOT NULL,
    ADD COLUMN `product_unit_id` BIGINT NULL,
    ADD COLUMN `quantity_in_base` DECIMAL(18, 6) NOT NULL,
    ADD COLUMN `reference_id` BIGINT NULL,
    ADD COLUMN `reference_type` VARCHAR(50) NULL,
    ADD COLUMN `transaction_type` VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE `invoice_items` DROP COLUMN `baseQuantity`,
    DROP COLUMN `conversionFactorSnapshot`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `invoiceId`,
    DROP COLUMN `itemNameSnapshot`,
    DROP COLUMN `itemType`,
    DROP COLUMN `productId`,
    DROP COLUMN `productUnitId`,
    DROP COLUMN `purchasePriceSnapshot`,
    DROP COLUMN `serviceId`,
    DROP COLUMN `tax`,
    DROP COLUMN `unitNameSnapshot`,
    DROP COLUMN `unitPrice`,
    ADD COLUMN `conversion_factor` DECIMAL(18, 6) NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `invoice_id` BIGINT NOT NULL,
    ADD COLUMN `item_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `product_id` BIGINT NULL,
    ADD COLUMN `product_unit_id` BIGINT NULL,
    ADD COLUMN `service_id` BIGINT NULL,
    ADD COLUMN `unit_name` VARCHAR(100) NULL,
    ADD COLUMN `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY `quantity` DECIMAL(18, 6) NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `invoices` DROP COLUMN `clinicId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `invoiceDate`,
    DROP COLUMN `invoiceNumber`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `patientRecordId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `clinic_id` BIGINT NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `created_by` CHAR(36) NULL,
    ADD COLUMN `invoice_date` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `invoice_number` VARCHAR(100) NOT NULL,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `patient_record_id` BIGINT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE `medical_cases` DROP COLUMN `closedAt`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `doctorId`,
    DROP COLUMN `openedAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `patientRecordId`,
    DROP COLUMN `title`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `clinic_id` BIGINT NULL,
    ADD COLUMN `closed_at` DATETIME(6) NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `opened_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `opened_by` CHAR(36) NULL,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `patient_record_id` BIGINT NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `status` VARCHAR(20) NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE `medical_requests` DROP COLUMN `createdAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `requestType`,
    DROP COLUMN `title`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `visitId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `request_type` VARCHAR(50) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    ADD COLUMN `visit_id` BIGINT NOT NULL,
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'requested';

-- AlterTable
ALTER TABLE `organization_appointment_settings` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `discountedFollowUpCount`,
    DROP COLUMN `examinationPrice`,
    DROP COLUMN `followUpPeriodDays`,
    DROP COLUMN `followUpPrice`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `discounted_follow_up_count` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `follow_up_period_days` INTEGER NOT NULL DEFAULT 15,
    ADD COLUMN `follow_up_price` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `main_exam_price` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    ADD PRIMARY KEY (`organization_id`);

-- AlterTable
ALTER TABLE `organization_settings` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `currencyCode`,
    DROP COLUMN `inventoryEnabled`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `unitConversionEnabled`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `currency_code` VARCHAR(10) NOT NULL DEFAULT 'EGP',
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    ADD PRIMARY KEY (`organization_id`);

-- AlterTable
ALTER TABLE `organizations` DROP PRIMARY KEY,
    DROP COLUMN `address`,
    DROP COLUMN `code`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `phone`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `logo_url` TEXT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `name` VARCHAR(150) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `patient_accounts` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `dateOfBirth`,
    DROP COLUMN `email`,
    DROP COLUMN `fullName`,
    DROP COLUMN `nationalId`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `date_of_birth` DATE NULL,
    ADD COLUMN `full_name` VARCHAR(150) NOT NULL,
    ADD COLUMN `national_id` VARCHAR(50) NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `phone` VARCHAR(30) NOT NULL,
    MODIFY `gender` VARCHAR(20) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `patient_records` DROP COLUMN `address`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `patientAccountId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `medical_record_number` VARCHAR(100) NULL,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `patient_account_id` CHAR(36) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL;

-- AlterTable
ALTER TABLE `patient_shares` DROP COLUMN `createdAt`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `patientAccountId`,
    DROP COLUMN `revokedAt`,
    DROP COLUMN `sourceOrganizationId`,
    DROP COLUMN `status`,
    DROP COLUMN `targetOrganizationId`,
    ADD COLUMN `from_organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `granted_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `patient_account_id` CHAR(36) NOT NULL,
    ADD COLUMN `revoked_at` DATETIME(6) NULL,
    ADD COLUMN `to_organization_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `createdAt`,
    DROP COLUMN `invoiceId`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `paymentDate`,
    DROP COLUMN `paymentMethod`,
    DROP COLUMN `reference`,
    DROP COLUMN `status`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `created_by` CHAR(36) NULL,
    ADD COLUMN `invoice_id` BIGINT NOT NULL,
    ADD COLUMN `paid_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `payment_method` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `permissions` DROP COLUMN `code`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    MODIFY `name` VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE `prescription_items` DROP COLUMN `createdAt`,
    DROP COLUMN `medicationName`,
    DROP COLUMN `prescriptionId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `medication_name` VARCHAR(200) NOT NULL,
    ADD COLUMN `prescription_id` BIGINT NOT NULL,
    MODIFY `dosage` VARCHAR(100) NULL,
    MODIFY `frequency` VARCHAR(100) NULL,
    MODIFY `duration` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `prescriptions` DROP COLUMN `createdAt`,
    DROP COLUMN `doctorId`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `visitId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `visit_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `product_unit_role_permissions` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `productUnitId`,
    DROP COLUMN `roleId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `product_unit_id` BIGINT NOT NULL,
    ADD COLUMN `role_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`product_unit_id`, `role_id`);

-- AlterTable
ALTER TABLE `product_units` DROP COLUMN `createdAt`,
    DROP COLUMN `factorToBase`,
    DROP COLUMN `isPurchaseUnit`,
    DROP COLUMN `isSaleUnit`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `productId`,
    DROP COLUMN `purchasePrice`,
    DROP COLUMN `salePrice`,
    DROP COLUMN `status`,
    DROP COLUMN `unitCategoryId`,
    DROP COLUMN `unitId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `factor_to_base` DECIMAL(18, 6) NOT NULL DEFAULT 1,
    ADD COLUMN `is_purchase_unit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_sale_unit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `product_id` BIGINT NOT NULL,
    ADD COLUMN `purchase_price` DECIMAL(12, 2) NULL,
    ADD COLUMN `sale_price` DECIMAL(12, 2) NULL,
    ADD COLUMN `unit_id` BIGINT NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `basePurchasePrice`,
    DROP COLUMN `baseSalePrice`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `sku`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `barcode` VARCHAR(100) NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `name` VARCHAR(200) NOT NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `ipAddress`,
    DROP COLUMN `rememberMe`,
    DROP COLUMN `revokedAt`,
    DROP COLUMN `tokenHash`,
    DROP COLUMN `userAgent`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `expires_at` DATETIME(6) NOT NULL,
    ADD COLUMN `revoked_at` DATETIME(6) NULL,
    ADD COLUMN `token_hash` VARCHAR(255) NOT NULL,
    ADD COLUMN `user_id` CHAR(36) NOT NULL,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `role_permissions` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `permissionId`,
    DROP COLUMN `roleId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `permission_id` BIGINT NOT NULL,
    ADD COLUMN `role_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`role_id`, `permission_id`);

-- AlterTable
ALTER TABLE `roles` DROP COLUMN `createdAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `status`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `is_system_role` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL;

-- AlterTable
ALTER TABLE `services` DROP COLUMN `createdAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `salePrice`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `price` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `name` VARCHAR(200) NOT NULL;

-- AlterTable
ALTER TABLE `specialties` DROP COLUMN `createdAt`,
    DROP COLUMN `status`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

-- AlterTable
ALTER TABLE `unit_categories` DROP COLUMN `createdAt`,
    DROP COLUMN `defaultUnitId`,
    DROP COLUMN `status`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `default_unit_id` BIGINT NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL;

-- AlterTable
ALTER TABLE `units` DROP COLUMN `createdAt`,
    DROP COLUMN `status`,
    DROP COLUMN `unitCategoryId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `unit_category_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `user_roles` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `roleId`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `role_id` BIGINT NOT NULL,
    ADD COLUMN `user_id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `role_id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `fullName`,
    DROP COLUMN `lastLoginAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `passwordHash`,
    DROP COLUMN `phone`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `full_name` VARCHAR(150) NOT NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `last_login_at` DATETIME(6) NULL,
    ADD COLUMN `organization_id` CHAR(36) NOT NULL,
    ADD COLUMN `password_hash` TEXT NOT NULL,
    ADD COLUMN `phone_number` VARCHAR(30) NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `visits` DROP COLUMN `appointmentId`,
    DROP COLUMN `complaints`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `diagnosisSummary`,
    DROP COLUMN `doctorId`,
    DROP COLUMN `examination`,
    DROP COLUMN `medicalCaseId`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `patientRecordId`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `visitAt`,
    ADD COLUMN `appointment_id` BIGINT NOT NULL,
    ADD COLUMN `completed_at` DATETIME(6) NULL,
    ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN `doctor_id` CHAR(36) NOT NULL,
    ADD COLUMN `started_at` DATETIME(6) NULL,
    ADD COLUMN `updated_at` DATETIME(6) NOT NULL;

-- CreateTable
CREATE TABLE `expense_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `organization_id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `expense_categories_organization_id_name_key`(`organization_id`, `name`),
    UNIQUE INDEX `expense_categories_organization_id_id_key`(`organization_id`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `organization_id` CHAR(36) NOT NULL,
    `clinic_id` BIGINT NULL,
    `category_id` BIGINT NULL,
    `recurring_expense_id` BIGINT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `expense_date` DATE NOT NULL DEFAULT (CURRENT_DATE),
    `payment_method` VARCHAR(50) NULL,
    `reference_number` VARCHAR(100) NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `expenses_organization_id_expense_date_idx`(`organization_id`, `expense_date`),
    INDEX `expenses_clinic_id_expense_date_idx`(`clinic_id`, `expense_date`),
    INDEX `expenses_category_id_idx`(`category_id`),
    INDEX `expenses_recurring_expense_id_idx`(`recurring_expense_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_expenses` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `organization_id` CHAR(36) NOT NULL,
    `clinic_id` BIGINT NULL,
    `category_id` BIGINT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `recurrence_type` VARCHAR(20) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `next_due_date` DATE NOT NULL,
    `payment_method` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `recurring_expenses_organization_id_next_due_date_is_active_idx`(`organization_id`, `next_due_date`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `refresh_token_id` CHAR(36) NULL,
    `device_name` VARCHAR(150) NULL,
    `device_type` VARCHAR(50) NULL,
    `ip_address` VARCHAR(45) NULL,
    `last_used_at` DATETIME(6) NULL,
    `expires_at` DATETIME(6) NOT NULL,
    `revoked_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `login_sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(6) NOT NULL,
    `used_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `password_reset_tokens_token_hash_key`(`token_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `organization_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NULL,
    `entity_id` TEXT NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `audit_logs_organization_id_created_at_idx`(`organization_id`, `created_at`),
    INDEX `audit_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `appointments_doctor_id_appointment_at_idx` ON `appointments`(`doctor_id`, `appointment_at`);

-- CreateIndex
CREATE INDEX `appointments_patient_record_id_appointment_at_idx` ON `appointments`(`patient_record_id`, `appointment_at`);

-- CreateIndex
CREATE INDEX `appointments_clinic_id_appointment_at_idx` ON `appointments`(`clinic_id`, `appointment_at`);

-- CreateIndex
CREATE INDEX `attachments_patient_record_id_idx` ON `attachments`(`patient_record_id`);

-- CreateIndex
CREATE INDEX `clinic_specialties_specialty_id_idx` ON `clinic_specialties`(`specialty_id`);

-- CreateIndex
CREATE INDEX `clinic_users_user_id_idx` ON `clinic_users`(`user_id`);

-- CreateIndex
CREATE INDEX `clinics_organization_id_idx` ON `clinics`(`organization_id`);

-- CreateIndex
CREATE UNIQUE INDEX `clinics_organization_id_id_key` ON `clinics`(`organization_id`, `id`);

-- CreateIndex
CREATE INDEX `diagnoses_visit_id_idx` ON `diagnoses`(`visit_id`);

-- CreateIndex
CREATE INDEX `doctor_specialties_specialty_id_idx` ON `doctor_specialties`(`specialty_id`);

-- CreateIndex
CREATE INDEX `inventory_product_id_idx` ON `inventory`(`product_id`);

-- CreateIndex
CREATE UNIQUE INDEX `inventory_clinic_id_product_id_key` ON `inventory`(`clinic_id`, `product_id`);

-- CreateIndex
CREATE INDEX `inventory_transactions_inventory_id_idx` ON `inventory_transactions`(`inventory_id`);

-- CreateIndex
CREATE INDEX `invoice_items_invoice_id_idx` ON `invoice_items`(`invoice_id`);

-- CreateIndex
CREATE UNIQUE INDEX `invoices_organization_id_invoice_number_key` ON `invoices`(`organization_id`, `invoice_number`);

-- CreateIndex
CREATE INDEX `medical_cases_patient_record_id_idx` ON `medical_cases`(`patient_record_id`);

-- CreateIndex
CREATE INDEX `medical_requests_visit_id_idx` ON `medical_requests`(`visit_id`);

-- CreateIndex
CREATE INDEX `patient_records_organization_id_idx` ON `patient_records`(`organization_id`);

-- CreateIndex
CREATE UNIQUE INDEX `patient_records_organization_id_patient_account_id_key` ON `patient_records`(`organization_id`, `patient_account_id`);

-- CreateIndex
CREATE UNIQUE INDEX `patient_records_organization_id_id_key` ON `patient_records`(`organization_id`, `id`);

-- CreateIndex
CREATE INDEX `patient_shares_patient_account_id_idx` ON `patient_shares`(`patient_account_id`);

-- CreateIndex
CREATE INDEX `payments_invoice_id_idx` ON `payments`(`invoice_id`);

-- CreateIndex
CREATE UNIQUE INDEX `permissions_name_key` ON `permissions`(`name`);

-- CreateIndex
CREATE INDEX `prescriptions_visit_id_idx` ON `prescriptions`(`visit_id`);

-- CreateIndex
CREATE INDEX `product_unit_role_permissions_role_id_idx` ON `product_unit_role_permissions`(`role_id`);

-- CreateIndex
CREATE INDEX `product_units_product_id_idx` ON `product_units`(`product_id`);

-- CreateIndex
CREATE UNIQUE INDEX `product_units_product_id_unit_id_key` ON `product_units`(`product_id`, `unit_id`);

-- CreateIndex
CREATE INDEX `products_organization_id_barcode_idx` ON `products`(`organization_id`, `barcode`);

-- CreateIndex
CREATE UNIQUE INDEX `products_organization_id_id_key` ON `products`(`organization_id`, `id`);

-- CreateIndex
CREATE UNIQUE INDEX `refresh_tokens_token_hash_key` ON `refresh_tokens`(`token_hash`);

-- CreateIndex
CREATE INDEX `refresh_tokens_user_id_idx` ON `refresh_tokens`(`user_id`);

-- CreateIndex
CREATE INDEX `refresh_tokens_expires_at_idx` ON `refresh_tokens`(`expires_at`);

-- CreateIndex
CREATE INDEX `role_permissions_permission_id_idx` ON `role_permissions`(`permission_id`);

-- CreateIndex
CREATE INDEX `roles_organization_id_idx` ON `roles`(`organization_id`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_organization_id_name_key` ON `roles`(`organization_id`, `name`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_organization_id_id_key` ON `roles`(`organization_id`, `id`);

-- CreateIndex
CREATE UNIQUE INDEX `units_unit_category_id_name_key` ON `units`(`unit_category_id`, `name`);

-- CreateIndex
CREATE UNIQUE INDEX `units_unit_category_id_id_key` ON `units`(`unit_category_id`, `id`);

-- CreateIndex
CREATE INDEX `user_roles_role_id_idx` ON `user_roles`(`role_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);

-- CreateIndex
CREATE INDEX `users_organization_id_idx` ON `users`(`organization_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_organization_id_id_key` ON `users`(`organization_id`, `id`);

-- CreateIndex
CREATE UNIQUE INDEX `visits_appointment_id_key` ON `visits`(`appointment_id`);

-- AddForeignKey
ALTER TABLE `unit_categories` ADD CONSTRAINT `unit_categories_default_unit_id_fkey` FOREIGN KEY (`default_unit_id`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinics` ADD CONSTRAINT `clinics_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_settings` ADD CONSTRAINT `organization_settings_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_appointment_settings` ADD CONSTRAINT `organization_appointment_settings_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `units` ADD CONSTRAINT `units_unit_category_id_fkey` FOREIGN KEY (`unit_category_id`) REFERENCES `unit_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_users` ADD CONSTRAINT `clinic_users_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_users` ADD CONSTRAINT `clinic_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_specialties` ADD CONSTRAINT `doctor_specialties_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_specialties` ADD CONSTRAINT `doctor_specialties_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_specialties` ADD CONSTRAINT `clinic_specialties_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_specialties` ADD CONSTRAINT `clinic_specialties_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_records` ADD CONSTRAINT `patient_records_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_records` ADD CONSTRAINT `patient_records_patient_account_id_fkey` FOREIGN KEY (`patient_account_id`) REFERENCES `patient_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_shares` ADD CONSTRAINT `patient_shares_patient_account_id_fkey` FOREIGN KEY (`patient_account_id`) REFERENCES `patient_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_shares` ADD CONSTRAINT `patient_shares_from_organization_id_fkey` FOREIGN KEY (`from_organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_shares` ADD CONSTRAINT `patient_shares_to_organization_id_fkey` FOREIGN KEY (`to_organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_schedules` ADD CONSTRAINT `doctor_schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_schedules` ADD CONSTRAINT `clinic_schedules_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_cases` ADD CONSTRAINT `medical_cases_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_cases` ADD CONSTRAINT `medical_cases_patient_record_id_fkey` FOREIGN KEY (`patient_record_id`) REFERENCES `patient_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_cases` ADD CONSTRAINT `medical_cases_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_cases` ADD CONSTRAINT `medical_cases_opened_by_fkey` FOREIGN KEY (`opened_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patient_record_id_fkey` FOREIGN KEY (`patient_record_id`) REFERENCES `patient_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_medical_case_id_fkey` FOREIGN KEY (`medical_case_id`) REFERENCES `medical_cases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnoses` ADD CONSTRAINT `diagnoses_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription_items` ADD CONSTRAINT `prescription_items_prescription_id_fkey` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_requests` ADD CONSTRAINT `medical_requests_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_patient_record_id_fkey` FOREIGN KEY (`patient_record_id`) REFERENCES `patient_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_medical_request_id_fkey` FOREIGN KEY (`medical_request_id`) REFERENCES `medical_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_unit_role_permissions` ADD CONSTRAINT `product_unit_role_permissions_product_unit_id_fkey` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_unit_role_permissions` ADD CONSTRAINT `product_unit_role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_patient_record_id_fkey` FOREIGN KEY (`patient_record_id`) REFERENCES `patient_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_product_unit_id_fkey` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_product_unit_id_fkey` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_categories` ADD CONSTRAINT `expense_categories_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_recurring_expense_id_fkey` FOREIGN KEY (`recurring_expense_id`) REFERENCES `recurring_expenses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_sessions` ADD CONSTRAINT `login_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_sessions` ADD CONSTRAINT `login_sessions_refresh_token_id_fkey` FOREIGN KEY (`refresh_token_id`) REFERENCES `refresh_tokens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
