INSERT INTO `global_specialties`
    (`code`, `name_en`, `name_ar`, `description_en`, `description_ar`, `image_url`, `sort_order`)
VALUES
    ('cardiology', 'Cardiology', 'أمراض القلب', 'Care for heart and circulatory system conditions.', 'رعاية أمراض القلب والدورة الدموية.', 'global-public/specialty-images/cardiology.svg', 1),
    ('dermatology', 'Dermatology', 'الأمراض الجلدية', 'Care for skin, hair, and nail conditions.', 'رعاية أمراض الجلد والشعر والأظافر.', 'global-public/specialty-images/dermatology.svg', 2),
    ('dentistry', 'Dentistry', 'طب الأسنان', 'Prevention and treatment of teeth and oral conditions.', 'الوقاية من أمراض الأسنان والفم وعلاجها.', 'global-public/specialty-images/dentistry.svg', 3),
    ('endocrinology', 'Endocrinology', 'الغدد الصماء', 'Care for hormone and endocrine system conditions.', 'رعاية اضطرابات الهرمونات والغدد الصماء.', 'global-public/specialty-images/endocrinology.svg', 4),
    ('family-medicine', 'Family Medicine', 'طب الأسرة', 'Primary care for people of all ages.', 'رعاية أولية للأشخاص من جميع الأعمار.', 'global-public/specialty-images/family-medicine.svg', 5),
    ('gastroenterology', 'Gastroenterology', 'أمراض الجهاز الهضمي', 'Care for digestive system conditions.', 'رعاية أمراض الجهاز الهضمي.', 'global-public/specialty-images/gastroenterology.svg', 6),
    ('gynecology', 'Gynecology', 'أمراض النساء', 'Care for reproductive and gynecologic health.', 'رعاية الصحة الإنجابية وأمراض النساء.', 'global-public/specialty-images/gynecology.svg', 7),
    ('neurology', 'Neurology', 'طب الأعصاب', 'Care for brain, spinal cord, and nerve conditions.', 'رعاية أمراض الدماغ والحبل الشوكي والأعصاب.', 'global-public/specialty-images/neurology.svg', 8),
    ('ophthalmology', 'Ophthalmology', 'طب العيون', 'Medical and surgical care for eye conditions.', 'الرعاية الطبية والجراحية لأمراض العيون.', 'global-public/specialty-images/ophthalmology.svg', 9),
    ('orthopedics', 'Orthopedics', 'جراحة العظام', 'Care for bones, joints, muscles, and movement.', 'رعاية العظام والمفاصل والعضلات والحركة.', 'global-public/specialty-images/orthopedics.svg', 10),
    ('pediatrics', 'Pediatrics', 'طب الأطفال', 'Medical care for infants, children, and adolescents.', 'الرعاية الطبية للرضع والأطفال والمراهقين.', 'global-public/specialty-images/pediatrics.svg', 11),
    ('psychiatry', 'Psychiatry', 'الطب النفسي', 'Assessment and treatment of mental health conditions.', 'تقييم حالات الصحة النفسية وعلاجها.', 'global-public/specialty-images/psychiatry.svg', 12),
    ('radiology', 'Radiology', 'الأشعة', 'Medical imaging to support diagnosis and treatment.', 'التصوير الطبي لدعم التشخيص والعلاج.', 'global-public/specialty-images/radiology.svg', 13),
    ('urology', 'Urology', 'المسالك البولية', 'Care for urinary tract and male reproductive conditions.', 'رعاية أمراض المسالك البولية والجهاز التناسلي الذكري.', 'global-public/specialty-images/urology.svg', 14)
ON DUPLICATE KEY UPDATE
    `name_en` = VALUES(`name_en`),
    `name_ar` = VALUES(`name_ar`),
    `description_en` = VALUES(`description_en`),
    `description_ar` = VALUES(`description_ar`),
    `image_url` = VALUES(`image_url`),
    `sort_order` = VALUES(`sort_order`),
    `is_active` = true;
