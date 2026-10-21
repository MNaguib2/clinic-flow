import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore, getErrorMessage } from '@core/auth/auth.store';
import { StartupService } from './service/startup.service';
import type {
  StartupCertification,
  StartupOptions,
  StartupPayload,
  StartupPermission,
  StartupRole,
  StartupWorkExperience,
} from '@core/interfaces/startup.interfaces';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';

type ExperienceForm = FormGroup<{
  workplace: FormControl<string>;
  title: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  description: FormControl<string>;
}>;

type CertificationForm = FormGroup<{
  name: FormControl<string>;
  issuer: FormControl<string>;
  issuedAt: FormControl<string>;
  certificateUrl: FormControl<string>;
}>;

type RoleForm = FormGroup<{
  name: FormControl<string>;
  permissionIds: FormControl<string[]>;
}>;

type ClinicForm = FormGroup<{
  name: FormControl<string>;
  phone: FormControl<string>;
  address: FormControl<string>;
  specialties: FormControl<string[]>;
}>;

@Component({
  imports: [ReactiveFormsModule, TranslatePipe],
  providers: [StartupService],
  selector: 'app-startup',
  styleUrl: './startup.scss',
  templateUrl: './startup.html',
})
export class Startup implements OnInit {
  private readonly form_builder = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly auth_store = inject(AuthStore);
  private readonly startup_service = inject(StartupService);
  private readonly language_service = inject(LanguageService);

  protected readonly language = this.language_service.language;
  protected readonly step = signal(0);
  protected readonly is_loading = signal(false);
  protected readonly is_saving = signal(false);
  protected readonly error_message = signal<string | null>(null);
  protected readonly permissions = signal<StartupPermission[]>([]);
  protected readonly profile_preview_url = signal<string | null>(null);
  protected readonly organization_logo_preview_url = signal<string | null>(null);
  private profile_image: File | null = null;
  private organization_logo: File | null = null;
  private readonly certification_files = new Map<number, File>();

  protected readonly profile_form = this.form_builder.group({
    briefDescription: ['', Validators.maxLength(1000)],
    profileImageUrl: ['', Validators.maxLength(2000)],
    jobTitle: ['', Validators.maxLength(100)],
  });
  protected readonly previous_experiences = new FormArray<ExperienceForm>([
    this.create_experience(),
  ]);
  protected readonly current_experiences = new FormArray<ExperienceForm>([
    this.create_experience(),
  ]);
  protected readonly certifications = new FormArray<CertificationForm>([]);
  protected readonly roles = new FormArray<RoleForm>([]);
  protected readonly specialty_names = new FormArray<FormControl<string>>([]);
  protected readonly clinics = new FormArray<ClinicForm>([this.create_clinic()]);

  ngOnInit(): void {
    this.is_loading.set(true);
    this.startup_service.getOptions().subscribe({
      next: (options: StartupOptions) => this.permissions.set(options.permissions),
      error: (error: unknown) => {
        this.error_message.set(getErrorMessage(error));
        this.is_loading.set(false);
      },
      complete: () => this.is_loading.set(false),
    });
  }

  protected set_step(step: number): void {
    this.error_message.set(null);
    this.step.set(Math.max(0, Math.min(3, step)));
  }

  protected add_experience(target: 'previous' | 'current'): void {
    this.experience_array(target).push(this.create_experience());
  }

  protected remove_experience(target: 'previous' | 'current', index: number): void {
    this.experience_array(target).removeAt(index);
  }

  protected add_certification(): void {
    this.certifications.push(this.create_certification());
  }

  protected remove_certification(index: number): void {
    this.certifications.removeAt(index);
    const remaining_files = new Map<number, File>();
    for (const [file_index, file] of this.certification_files) {
      if (file_index < index) remaining_files.set(file_index, file);
      if (file_index > index) remaining_files.set(file_index - 1, file);
    }
    this.certification_files.clear();
    for (const [file_index, file] of remaining_files) {
      this.certification_files.set(file_index, file);
    }
  }

  protected upload_profile_image(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error_message.set(null);
    this.profile_image = file;
    this.profile_preview_url.set(URL.createObjectURL(file));
  }

  protected upload_organization_logo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error_message.set(null);
    this.organization_logo = file;
    this.organization_logo_preview_url.set(URL.createObjectURL(file));
  }

  protected upload_certification_file(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error_message.set(null);
    this.certification_files.set(index, file);
  }

  protected has_certification_file(index: number): boolean {
    return this.certification_files.has(index);
  }

  protected add_role(): void {
    this.roles.push(
      this.form_builder.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        permissionIds: this.form_builder.control<string[]>([]),
      }),
    );
  }

  protected remove_role(index: number): void {
    this.roles.removeAt(index);
  }

  protected add_specialty(): void {
    this.specialty_names.push(
      this.form_builder.control('', Validators.maxLength(150)),
    );
  }

  protected remove_specialty(index: number): void {
    this.specialty_names.removeAt(index);
  }

  protected add_clinic(): void {
    this.clinics.push(this.create_clinic());
  }

  protected remove_clinic(index: number): void {
    if (this.clinics.length > 1) this.clinics.removeAt(index);
  }

  protected save(): void {
    this.error_message.set(null);
    const clinic_values = this.clinics.getRawValue();
    if (clinic_values.some((clinic) => !clinic.name.trim())) {
      this.error_message.set('startup.clinicNameRequired');
      return;
    }

    const specialties = this.unique_names(this.specialty_names.getRawValue());
    const certification_rows = this.certification_values();
    const certification_files = new Map<number, File>();
    certification_rows.forEach((row, data_index) => {
      const file = this.certification_files.get(row.source_index);
      if (file) certification_files.set(data_index, file);
    });
    const payload: StartupPayload = {
      briefDescription:
        this.profile_form.controls.briefDescription.value.trim() || undefined,
      profileImageUrl:
        this.profile_form.controls.profileImageUrl.value.trim() || undefined,
      jobTitle: this.profile_form.controls.jobTitle.value.trim() || undefined,
      previousWorkingExperiences: this.work_experiences(
        this.previous_experiences,
      ),
      currentWorkingExperiences: this.work_experiences(this.current_experiences),
      certifications: certification_rows.map((row) => row.value),
      roles: this.role_values(),
      specialties,
      clinics: clinic_values.map((clinic) => ({
        name: clinic.name.trim(),
        phone: clinic.phone.trim() || undefined,
        address: clinic.address.trim() || undefined,
        specialties: clinic.specialties.filter((name) =>
          specialties.includes(name),
        ),
      })),
    };

    this.is_saving.set(true);
    this.startup_service
      .complete(
        payload,
        this.profile_image,
        this.organization_logo,
        certification_files,
      )
      .subscribe({
        next: () => {
          this.auth_store.markStartupComplete();
          this.router.navigateByUrl('/dashboard');
        },
        error: (error: unknown) => {
          this.error_message.set(getErrorMessage(error));
          this.is_saving.set(false);
        },
        complete: () => this.is_saving.set(false),
      });
  }

  protected permission_description(permission: StartupPermission): string {
    return this.language() === 'ar'
      ? permission.description_ar ?? permission.name
      : permission.description_en ?? permission.name;
  }

  private experience_array(target: 'previous' | 'current'): FormArray<ExperienceForm> {
    return target === 'previous'
      ? this.previous_experiences
      : this.current_experiences;
  }

  private create_experience(): ExperienceForm {
    return this.form_builder.group({
      workplace: ['', Validators.maxLength(150)],
      title: ['', Validators.maxLength(150)],
      startDate: [''],
      endDate: [''],
      description: ['', Validators.maxLength(2000)],
    });
  }

  private create_certification(): CertificationForm {
    return this.form_builder.group({
      name: ['', Validators.maxLength(150)],
      issuer: ['', Validators.maxLength(150)],
      issuedAt: [''],
      certificateUrl: ['', Validators.maxLength(2000)],
    });
  }

  private create_clinic(): ClinicForm {
    return this.form_builder.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      phone: ['', Validators.maxLength(30)],
      address: ['', Validators.maxLength(2000)],
      specialties: this.form_builder.control<string[]>([]),
    });
  }

  private work_experiences(
    rows: FormArray<ExperienceForm>,
  ): StartupWorkExperience[] {
    return rows
      .getRawValue()
      .filter((row) => row.workplace.trim() && row.title.trim())
      .map((row) => ({
        workplace: row.workplace.trim(),
        title: row.title.trim(),
        startDate: row.startDate || undefined,
        endDate: row.endDate || undefined,
        description: row.description.trim() || undefined,
      }));
  }

  private certification_values(): {
    value: StartupCertification;
    source_index: number;
  }[] {
    return this.certifications
      .controls
      .flatMap((form, source_index) => {
        const row = form.getRawValue();
        if (!row.name.trim()) return [];
        return [{
          source_index,
          value: {
            name: row.name.trim(),
            issuer: row.issuer.trim() || undefined,
            issuedAt: row.issuedAt || undefined,
            certificateUrl: row.certificateUrl.trim() || undefined,
          },
        }];
      });
  }

  private role_values(): StartupRole[] {
    return this.roles
      .getRawValue()
      .filter((role) => role.name.trim())
      .map((role) => ({
        name: role.name.trim(),
        permissionIds: role.permissionIds,
      }));
  }

  private unique_names(names: string[]): string[] {
    return [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  }
}
