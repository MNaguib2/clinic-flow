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
  name: string;
  description_en: string | null;
  description_ar: string | null;
  page: StartupPage;
}

export interface StartupPage {
  name: string;
  description_en: string;
  description_ar: string;
}

export interface StartupOptions {
  permissions: StartupPermission[];
}

export interface StartupResult {
  completed: boolean;
  clinics: { id: string; name: string }[];
}

