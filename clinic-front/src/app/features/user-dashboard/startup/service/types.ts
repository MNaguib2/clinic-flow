import { FormControl, FormGroup } from "@angular/forms";

export type ExperienceForm = FormGroup<{
  workplace: FormControl<string>;
  title: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  description: FormControl<string>;
}>;

export type CertificationForm = FormGroup<{
  name: FormControl<string>;
  issuer: FormControl<string>;
  issuedAt: FormControl<string>;
  certificateUrl: FormControl<string>;
}>;

export type RoleForm = FormGroup<{
  name: FormControl<string>;
  permissionIds: FormControl<string[]>;
}>;

export type ClinicForm = FormGroup<{
  name: FormControl<string>;
  phone: FormControl<string>;
  address: FormControl<string>;
  specialties: FormControl<string[]>;
}>;
