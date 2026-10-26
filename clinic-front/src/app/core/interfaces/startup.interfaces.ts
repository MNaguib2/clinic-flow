export interface StartupWorkExperience {
  workplace: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface StartupCertification {
  name: string;
  issuer?: string;
  issuedAt?: string;
  certificateUrl?: string;
}

export interface StartupRole {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface StartupClinic {
  name: string;
  phone?: string;
  address?: string;
  specialties: string[];
}

export interface StartupPayload {
  briefDescription?: string;
  profileImageUrl?: string;
  email?: string;
  jobTitle?: string;
  previousWorkingExperiences: StartupWorkExperience[];
  currentWorkingExperiences: StartupWorkExperience[];
  certifications: StartupCertification[];
  roles: StartupRole[];
  specialties: string[];
  clinics: StartupClinic[];
}

export interface StartupPermission {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  page: StartupPage;
}

export interface StartupPage {
  key: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
}

export interface StartupOptions {
  permissions: StartupPermission[];
  globalSpecialties?: StartupGlobalSpecialty[];
}

export interface StartupGlobalSpecialty {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  imageUrl: string;
}

export interface StartupResult {
  completed: boolean;
  clinics: { id: string; name: string }[];
}

