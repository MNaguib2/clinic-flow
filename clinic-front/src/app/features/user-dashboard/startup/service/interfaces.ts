export interface ExperienceModel {
  workplace: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CertificationModel {
  name: string;
  issuer: string;
  issuedAt: string;
  certificateUrl: string;
}

export interface RoleModel {
  name: string;
  permissionIds: string[];
}

export interface ClinicModel {
  name: string;
  phone: string;
  address: string;
  specialties: string[];
}

export interface StartupModel {
  briefDescription: string;
  profileImageUrl: string;
  jobTitle: string;
  previousExperiences: ExperienceModel[];
  currentExperiences: ExperienceModel[];
  certifications: CertificationModel[];
  roles: RoleModel[];
  specialtyNames: string[];
  clinics: ClinicModel[];
}

export type ExperienceTarget = 'previousExperiences' | 'currentExperiences';
