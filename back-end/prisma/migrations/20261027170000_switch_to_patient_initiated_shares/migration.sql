-- Drop the request relation before removing its table.
ALTER TABLE `patient_shares` DROP FOREIGN KEY `patient_shares_request_id_fkey`;
ALTER TABLE `patient_shares` DROP INDEX `patient_shares_request_id_key`;
ALTER TABLE `patient_shares`
    DROP COLUMN `request_id`,
    ADD COLUMN `consent_ip_address` VARCHAR(45) NULL,
    ADD COLUMN `consent_user_agent` TEXT NULL;

-- Remove institution-initiated requests and their foreign keys.
ALTER TABLE `patient_share_requests`
    DROP FOREIGN KEY `patient_share_requests_patient_account_id_fkey`,
    DROP FOREIGN KEY `patient_share_requests_to_organization_id_fkey`,
    DROP FOREIGN KEY `patient_share_requests_target_record_fkey`,
    DROP FOREIGN KEY `patient_share_requests_target_doctor_fkey`,
    DROP FOREIGN KEY `patient_share_requests_requested_by_fkey`;

DROP TABLE `patient_share_requests`;