import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore, getErrorMessage } from '@core/auth/auth.store';
import { StartupService } from './service/startup.service';
import type {
  StartupCertification,
  StartupOptions,
  StartupPage,
  StartupPayload,
  StartupPermission,
  StartupRole,
  StartupWorkExperience,
} from '@core/interfaces/startup.interfaces';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CertificationForm, ClinicForm, ExperienceForm, RoleForm } from './service/types';

type LocalizedPage = StartupPage & { name: string; description: string };
type LocalizedPermission = Omit<StartupPermission, 'page'> & {
  name: string;
  description: string;
  page: LocalizedPage;
};
type PermissionPageGroup = { page: LocalizedPage; permissions: LocalizedPermission[] };

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
  private readonly destroy_ref = inject(DestroyRef);

  protected readonly language = this.language_service.language;
  protected readonly step = signal(0);
  protected readonly step_keys = [
    'organizationStep',
    'profileStep',
    'rolesStep',
    'specialtiesStep',
    'clinicsStep',
  ] as const;
  protected readonly is_loading = signal(false);
  protected readonly is_saving = signal(false);
  protected readonly error_message = signal<string | null>(null);
  private readonly raw_permissions = signal<StartupPermission[]>([]);
  protected readonly permissions = computed<LocalizedPermission[]>(() => {
    const is_ar = this.language_service.language() === 'ar';
    const localize_page = (page: StartupPage): LocalizedPage => ({
      ...page,
      name: (is_ar ? page.name_ar : page.name_en) || page.key,
      description: (is_ar ? page.description_ar : page.description_en) || page.key,
    });
    return this.raw_permissions().map((permission) => ({
      ...permission,
      name: (is_ar ? permission.name_ar : permission.name_en) || permission.code,
      description:
        (is_ar ? permission.description_ar : permission.description_en) ?? permission.code,
      page: localize_page(permission.page),
    }));
  });
  protected readonly permission_pages = computed(() => {
    const page_map = new Map<string, PermissionPageGroup>();
    for (const permission of this.permissions()) {
      const group = page_map.get(permission.page.key) ?? {
        page: permission.page,
        permissions: [],
      };
      group.permissions.push(permission);
      page_map.set(permission.page.key, group);
    }
    return [...page_map.values()];
  });
  protected readonly profile_preview_url = signal<string | null>(null);
  protected readonly organization_logo_preview_url = signal<string | null>(null);
  protected readonly organization_logo_file_name = signal<string | null>(null);
  protected readonly organization_logo_error = signal<string | null>(null);
  private profile_image: File | null = null;
  private organization_logo: File | null = null;
  private readonly certification_files = new Map<number, File>();
  private clinic_images = new Map<number, File>();
  private specialty_images = new Map<number, File>();
  protected readonly specialty_image_previews = signal(new Map<number, string>());
  protected readonly clinic_image_previews = signal(new Map<number, string>());

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
      next: (options: StartupOptions) => this.raw_permissions.set(options.permissions),
      error: (error: unknown) => {
        this.error_message.set(getErrorMessage(error));
        this.is_loading.set(false);
      },
      complete: () => this.is_loading.set(false),
    });
  }

  protected set_step(step: number): void {
    this.error_message.set(null);
    this.step.set(Math.max(0, Math.min(4, step)));
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

    const accepted_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!accepted_types.includes(file.type)) {
      this.organization_logo_error.set('startup.organizationLogoInvalid');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.organization_logo_error.set('startup.organizationLogoTooLarge');
      input.value = '';
      return;
    }

    this.error_message.set(null);
    this.organization_logo_error.set(null);
    const previous_url = this.organization_logo_preview_url();
    if (previous_url) URL.revokeObjectURL(previous_url);
    this.organization_logo = file;
    this.organization_logo_file_name.set(file.name);
    this.organization_logo_preview_url.set(URL.createObjectURL(file));
  }

  protected clear_organization_logo(input: HTMLInputElement): void {
    const preview_url = this.organization_logo_preview_url();
    if (preview_url) URL.revokeObjectURL(preview_url);
    this.organization_logo = null;
    this.organization_logo_file_name.set(null);
    this.organization_logo_preview_url.set(null);
    this.organization_logo_error.set(null);
    input.value = '';
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

    const removed_url = this.specialty_image_previews().get(index);
    if (removed_url) URL.revokeObjectURL(removed_url);
    const shifted_files = new Map<number, File>();
    for (const [file_index, file] of this.specialty_images) {
      if (file_index < index) shifted_files.set(file_index, file);
      if (file_index > index) shifted_files.set(file_index - 1, file);
    }
    this.specialty_images = shifted_files;
    const shifted_previews = new Map<number, string>();
    for (const [preview_index, url] of this.specialty_image_previews()) {
      if (preview_index < index) shifted_previews.set(preview_index, url);
      if (preview_index > index) shifted_previews.set(preview_index - 1, url);
    }
    this.specialty_image_previews.set(shifted_previews);
  }

  protected upload_specialty_image(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const accepted_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!accepted_types.includes(file.type)) {
      this.error_message.set('startup.organizationLogoInvalid');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error_message.set('startup.organizationLogoTooLarge');
      input.value = '';
      return;
    }

    this.error_message.set(null);
    const previous_url = this.specialty_image_previews().get(index);
    if (previous_url) URL.revokeObjectURL(previous_url);
    this.specialty_images.set(index, file);
    this.specialty_image_previews.update((previews) =>
      new Map(previews).set(index, URL.createObjectURL(file)),
    );
  }

  protected add_clinic(): void {
    this.clinics.push(this.create_clinic());
  }

  protected upload_clinic_image(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const accepted_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!accepted_types.includes(file.type)) {
      this.error_message.set('startup.organizationLogoInvalid');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error_message.set('startup.organizationLogoTooLarge');
      input.value = '';
      return;
    }

    this.error_message.set(null);
    const previous_url = this.clinic_image_previews().get(index);
    if (previous_url) URL.revokeObjectURL(previous_url);
    this.clinic_images.set(index, file);
    this.clinic_image_previews.update((previews) =>
      new Map(previews).set(index, URL.createObjectURL(file)),
    );
  }

  protected remove_clinic(index: number): void {
    if (this.clinics.length <= 1) return;
    this.clinics.removeAt(index);

    const removed_url = this.clinic_image_previews().get(index);
    if (removed_url) URL.revokeObjectURL(removed_url);
    const shifted_files = new Map<number, File>();
    for (const [file_index, file] of this.clinic_images) {
      if (file_index < index) shifted_files.set(file_index, file);
      if (file_index > index) shifted_files.set(file_index - 1, file);
    }
    this.clinic_images = shifted_files;
    const shifted_previews = new Map<number, string>();
    for (const [preview_index, url] of this.clinic_image_previews()) {
      if (preview_index < index) shifted_previews.set(preview_index, url);
      if (preview_index > index) shifted_previews.set(preview_index - 1, url);
    }
    this.clinic_image_previews.set(shifted_previews);
  }

  protected save(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.error_message.set(null);
    const clinic_values = this.clinics.getRawValue();
    if (clinic_values.some((clinic) => !clinic.name.trim())) {
      this.error_message.set('startup.clinicNameRequired');
      return;
    }

    const specialties = this.unique_names(this.specialty_names.getRawValue());
    const specialty_images = new Map<number, File>();
    for (const [source_index, file] of this.specialty_images) {
      const name = this.specialty_names.at(source_index)?.value.trim();
      const data_index = name ? specialties.indexOf(name) : -1;
      if (data_index >= 0 && !specialty_images.has(data_index)) {
        specialty_images.set(data_index, file);
      }
    }
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
        this.clinic_images,
        specialty_images,
      )
      .subscribe({
        next: () => {
          this.auth_store.markStartupComplete();
          // this.router.navigateByUrl('/dashboard');
        },
        error: (error: unknown) => {
          this.error_message.set(getErrorMessage(error));
          this.is_saving.set(false);
        },
        complete: () => this.is_saving.set(false),
      });
  }

  protected permission_is_selected(role: RoleForm, permission_id: string): boolean {
    return role.controls.permissionIds.value.includes(permission_id);
  }

  protected selected_permission_count(
    role: RoleForm,
    page_group: PermissionPageGroup,
  ): number {
    const selected_ids = new Set(role.controls.permissionIds.value);
    return page_group.permissions.filter((permission) =>
      selected_ids.has(permission.id),
    ).length;
  }

  protected toggle_permission(
    role: RoleForm,
    permission_id: string,
    event: Event,
  ): void {
    const selected_ids = new Set(role.controls.permissionIds.value);
    if ((event.target as HTMLInputElement).checked) {
      selected_ids.add(permission_id);
    } else {
      selected_ids.delete(permission_id);
    }
    role.controls.permissionIds.setValue([...selected_ids]);
    role.controls.permissionIds.markAsDirty();
  }

  protected toggle_page_permissions(
    role: RoleForm,
    page_group: PermissionPageGroup,
    event: Event,
  ): void {
    const selected_ids = new Set(role.controls.permissionIds.value);
    for (const permission of page_group.permissions) {
      if ((event.target as HTMLInputElement).checked) {
        selected_ids.add(permission.id);
      } else {
        selected_ids.delete(permission.id);
      }
    }
    role.controls.permissionIds.setValue([...selected_ids]);
    role.controls.permissionIds.markAsDirty();
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
