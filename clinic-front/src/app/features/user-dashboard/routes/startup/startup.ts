import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  applyEach,
  FieldTree,
  form,
  FormField,
  maxLength,
  required,
} from '@angular/forms/signals';
import { AuthStore } from '@core/auth/auth.store';
import { ErrorService } from '@core/services/error/error.service';
import { StartupService } from './service/startup.service';
import type {
  StartupCertification,
  StartupGlobalSpecialty,
  StartupOptions,
  StartupPage,
  StartupPayload,
  StartupPermission,
  StartupRole,
  StartupWorkExperience,
} from '@core/interfaces/startup.interfaces';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import type {
  CertificationModel,
  ClinicModel,
  ExperienceModel,
  ExperienceTarget,
  RoleModel,
  StartupModel,
} from './service/interfaces';
import { ThemeService } from '@core/services/theme/theme.service';
import { FieldFile } from '@components/fields/field-file';
import { FieldImage } from '@components/fields/field-image';
import { FieldInput } from '@components/fields/field-input';
import { FieldPhone } from '@components/fields/field-phone';
import { FieldTextarea } from '@components/fields/field-textarea';
import { Icon } from '@components/icon/icon';
import { Welcome } from './welcome/welcome';

type LocalizedPage = StartupPage & { name: string; description: string };
type LocalizedPermission = Omit<StartupPermission, 'page'> & {
  name: string;
  description: string;
  page: LocalizedPage;
};
type PermissionPageGroup = { page: LocalizedPage; permissions: LocalizedPermission[] };
type VisiblePermissionPageGroup = {
  group: PermissionPageGroup;
  permissions: LocalizedPermission[];
};
type LocalizedGlobalSpecialty = StartupGlobalSpecialty & {
  name: string;
  description: string;
};

@Component({
  imports: [
    FieldFile,
    FieldImage,
    FieldInput,
    FieldPhone,
    FieldTextarea,
    FormField,
    Icon,
    NgTemplateOutlet,
    TranslatePipe,
    Welcome,
  ],
  providers: [StartupService],
  selector: 'app-startup',
  styleUrls: ['./startup.scss', './startup-specialties-roles.scss'],
  templateUrl: './startup.html',
})
export class Startup implements OnInit {
  private readonly auth_store = inject(AuthStore);
  private readonly theme = inject(ThemeService);
  private readonly startup_service = inject(StartupService);
  private readonly language_service = inject(LanguageService);

  protected readonly language = this.language_service.language;
  protected readonly step = signal(0);
  protected readonly step_keys = [
    'organizationStep',
    'profileStep',
    'rolesStep',
    'specialtiesStep',
    'clinicsStep',
    'reviewStep',
  ] as const;
  protected readonly step_hint_keys = [
    'organizationStepHint',
    'profileStepHint',
    'rolesStepHint',
    'specialtiesStepHint',
    'clinicsStepHint',
    'reviewStepHint',
  ] as const;
  protected readonly step_icons = [
    'building-2',
    'file-text',
    'users',
    'stethoscope',
    'hospital',
    'clipboard-check',
  ] as const;
  protected readonly image_hint = 'startup.organizationLogoHint';
  protected readonly max_certificate_size = 10 * 1024 * 1024;
  protected readonly is_loading = signal(false);
  protected readonly is_saving = signal(false);
  protected readonly is_complete = signal(false);
  protected readonly options_loaded = signal(false);
  protected readonly error_message = signal<string | null>(null);
  protected readonly specialty_search = signal('');
  protected readonly permission_search = signal('');
  protected readonly specialty_dropdown_open = signal(false);
  protected readonly role_permissions_open = signal(new Set<number>());
  private readonly raw_permissions = signal<StartupPermission[]>([]);
  private readonly raw_global_specialties = signal<StartupGlobalSpecialty[]>([]);

  protected readonly global_specialties = computed<LocalizedGlobalSpecialty[]>(() => {
    const is_ar = this.language_service.language() === 'ar';
    return this.raw_global_specialties().map((specialty) => ({
      ...specialty,
      name:
        (is_ar ? specialty.name_ar : specialty.name_en) ||
        (is_ar ? specialty.name_en : specialty.name_ar) ||
        specialty.code,
      description:
        (is_ar ? specialty.description_ar : specialty.description_en) ||
        (is_ar ? specialty.description_en : specialty.description_ar) ||
        '',
    }));
  });


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
  protected readonly filtered_specialties = computed(() => {
    const query = this.specialty_search().trim().toLocaleLowerCase();
    const selected_names = new Set(
      this.unique_names(this.model().specialtyNames).map((name) =>
        name.toLocaleLowerCase(),
      ),
    );
    return this.global_specialties()
      .filter((specialty) => {
        const aliases = [
          specialty.name,
          specialty.name_ar,
          specialty.name_en,
          specialty.code,
        ].map((name) => name.trim().toLocaleLowerCase());
        if (aliases.some((name) => selected_names.has(name))) {
          return false;
        }
        return !query || [
          specialty.name,
          specialty.code,
          specialty.description,
        ].some((value) => value.toLocaleLowerCase().includes(query));
      })
      .slice(0, 8);
  });
  protected readonly filtered_permission_pages = computed<VisiblePermissionPageGroup[]>(() => {
    const query = this.permission_search().trim().toLocaleLowerCase();
    return this.permission_pages().flatMap((group) => {
      const page_matches = !query || [
        group.page.key,
        group.page.name,
        group.page.description,
      ].some((value) => value.toLocaleLowerCase().includes(query));
      const permissions = page_matches
        ? group.permissions
        : group.permissions.filter((permission) => [
            permission.code,
            permission.name,
            permission.description,
          ].some((value) => value.toLocaleLowerCase().includes(query)));
      return permissions.length ? [{ group, permissions }] : [];
    });
  });
  protected profile_image: File | null = null;
  protected organization_logo: File | null = null;
  protected readonly certification_files = new Map<number, File>();
  protected clinic_images = new Map<number, File>();
  protected specialty_images = new Map<number, File>();
  protected readonly failed_catalog_images = signal(new Set<string>());

  protected readonly model = signal<StartupModel>({
    briefDescription: '',
    profileImageUrl: '',
    email: '',
    jobTitle: '',
    previousExperiences: [/*this.create_experience()*/],
    currentExperiences: [/*this.create_experience()*/],
    certifications: [],
    roles: [],
    specialtyNames: [],
    clinics: [this.create_clinic()],
  });
  protected readonly startup_form = form(this.model, (path) => {
    maxLength(path.briefDescription, 1000);
    maxLength(path.profileImageUrl, 2000);
    maxLength(path.email, 255);
    maxLength(path.jobTitle, 100);
    for (const experiences of [path.previousExperiences, path.currentExperiences]) {
      applyEach(experiences, (item) => {
        maxLength(item.workplace, 150);
        maxLength(item.title, 150);
        maxLength(item.description, 2000);
      });
    }
    applyEach(path.certifications, (item) => {
      maxLength(item.name, 150);
      maxLength(item.issuer, 150);
      maxLength(item.certificateUrl, 2000);
    });
    applyEach(path.roles, (item) => {
      required(item.name);
      maxLength(item.name, 100);
      maxLength(item.description, 2000);
    });
    applyEach(path.specialtyNames, (item) => {
      maxLength(item, 150);
    });
    applyEach(path.clinics, (item) => {
      required(item.name);
      maxLength(item.name, 150);
      maxLength(item.phone, 30);
      maxLength(item.address, 2000);
    });
  });

  ngOnInit(): void {
    this.is_loading.set(true);
    this.startup_service.getOptions().subscribe({
      next: (options: StartupOptions) => {
        this.raw_permissions.set(options.permissions ?? []);
        this.raw_global_specialties.set(options.globalSpecialties ?? []);
        this.options_loaded.set(true);
      },
      error: (error: unknown) => {
        const error_message = error instanceof ErrorService
          ? error.getErrorMessage()
          : error instanceof Error
            ? error.message
            : 'An unknown error occurred.';
        this.error_message.set(error_message);
        if (error instanceof ErrorService) error.show();
        this.options_loaded.set(true);
        this.is_loading.set(false);
      },
      complete: () => {
        this.options_loaded.set(true);
        this.is_loading.set(false);
      },
    });
  }

  protected set_step(step: number): void {
    this.error_message.set(null);
    this.step.set(Math.max(0, Math.min(5, step)));
  }

  protected summary_specialties(): string[] {
    return this.unique_names(this.model().specialtyNames);
  }

  protected summary_roles(): StartupRole[] {
    return this.role_values();
  }

  protected summary_clinics(): ClinicModel[] {
    return this.model().clinics;
  }

  protected summary_experience_count(target: ExperienceTarget): number {
    return this.work_experiences(this.model()[target]).length;
  }

  protected summary_certification_count(): number {
    return this.certification_values().length;
  }

  protected add_experience(target: ExperienceTarget): void {
    this.model.update((model) => ({
      ...model,
      [target]: [...model[target], this.create_experience()],
    }));
  }

  protected remove_experience(target: ExperienceTarget, index: number): void {
    this.model.update((model) => ({
      ...model,
      [target]: model[target].filter((_, item_index) => item_index !== index),
    }));
  }

  protected add_certification(): void {
    this.model.update((model) => ({
      ...model,
      certifications: [...model.certifications, this.create_certification()],
    }));
  }

  protected remove_certification(index: number): void {
    this.model.update((model) => ({
      ...model,
      certifications: model.certifications.filter((_, item_index) => item_index !== index),
    }));
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

  protected set_profile_image(file: File | null): void {
    this.error_message.set(null);
    this.profile_image = file;
  }

  protected set_organization_logo(file: File | null): void {
    this.error_message.set(null);
    this.organization_logo = file;
  }

  protected set_certification_file(index: number, value: File | File[] | null): void {
    const file = value instanceof File ? value : null;
    this.error_message.set(null);
    if (file) this.certification_files.set(index, file);
    else this.certification_files.delete(index);
  }

  protected set_clinic_image(index: number, file: File | null): void {
    this.error_message.set(null);
    if (file) this.clinic_images.set(index, file);
    else this.clinic_images.delete(index);
  }

  protected add_role(): void {
    if (this.model().roles.some((role) => !role.name.trim())) {
      this.error_message.set('startup.roleNameRequired');
      return;
    }
    this.error_message.set(null);
    const index = this.model().roles.length;
    this.model.update((model) => ({
      ...model,
      roles: [...model.roles, { name: '', description: '', permissionIds: [] }],
    }));
    this.role_permissions_open.update((open_roles) =>
      new Set([...open_roles, index]),
    );
  }

  protected remove_role(index: number): void {
    this.model.update((model) => ({
      ...model,
      roles: model.roles.filter((_, item_index) => item_index !== index),
    }));
    this.role_permissions_open.update((open_roles) =>
      new Set(
        [...open_roles]
          .filter((role_index) => role_index !== index)
          .map((role_index) => role_index > index ? role_index - 1 : role_index),
      ),
    );
  }

  protected toggle_role_permissions(index: number): void {
    this.role_permissions_open.update((open_roles) => {
      const next = new Set(open_roles);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  protected total_selected_permissions(): number {
    return this.model().roles.reduce(
      (total, role) => total + new Set(role.permissionIds).size,
      0,
    );
  }

  protected role_name_is_duplicate(role: FieldTree<RoleModel>): boolean {
    const name = role.name().value().trim().toLocaleLowerCase();
    return Boolean(
      name &&
        this.model().roles.filter(
          (item) => item.name.trim().toLocaleLowerCase() === name,
        ).length > 1,
    );
  }

  protected selected_role_permission_count(role: FieldTree<RoleModel>): number {
    return new Set(role.permissionIds().value()).size;
  }

  protected update_specialty_search(value: string): void {
    this.specialty_search.set(value);
    this.specialty_dropdown_open.set(true);
  }

  protected close_specialty_search(): void {
    this.specialty_dropdown_open.set(false);
  }

  protected select_specialty(specialty: LocalizedGlobalSpecialty): void {
    const aliases = new Set(
      [specialty.name, specialty.name_ar, specialty.name_en, specialty.code]
        .map((name) => name.trim().toLocaleLowerCase())
        .filter(Boolean),
    );
    if (!specialty.name.trim()) return;
    this.model.update((model) => {
      const already_selected = model.specialtyNames.some(
        (name) => aliases.has(name.trim().toLocaleLowerCase()),
      );
      return already_selected
        ? model
        : { ...model, specialtyNames: [...model.specialtyNames, specialty.name.trim()] };
    });
    this.specialty_search.set('');
    this.specialty_dropdown_open.set(false);
    this.error_message.set(null);
  }

  protected select_first_specialty(): void {
    const specialty = this.filtered_specialties()[0];
    if (specialty) this.select_specialty(specialty);
  }

  protected specialty_catalog_entry(
    name: string,
  ): LocalizedGlobalSpecialty | undefined {
    const normalized_name = name.trim().toLocaleLowerCase();
    return this.global_specialties().find(
      (specialty) =>
        [specialty.name, specialty.name_ar, specialty.name_en, specialty.code]
          .some((candidate) => candidate.trim().toLocaleLowerCase() === normalized_name),
    );
  }

  protected specialty_catalog_image_url(name: string): string | null {
    const specialty = this.specialty_catalog_entry(name);
    return specialty?.imageUrl
      ? this.startup_service.publicFileUrl(specialty.imageUrl)
      : null;
  }

  protected set_specialty_image(index: number, file: File | null): void {
    this.error_message.set(null);
    if (file) this.specialty_images.set(index, file);
    else this.specialty_images.delete(index);
  }

  protected catalog_image_failed(url: string): void {
    this.failed_catalog_images.update((urls) => new Set(urls).add(url));
  }

  protected remove_specialty(index: number): void {
    this.model.update((model) => ({
      ...model,
      specialtyNames: model.specialtyNames.filter((_, item_index) => item_index !== index),
    }));

    const shifted_files = new Map<number, File>();
    for (const [file_index, file] of this.specialty_images) {
      if (file_index < index) shifted_files.set(file_index, file);
      if (file_index > index) shifted_files.set(file_index - 1, file);
    }
    this.specialty_images = shifted_files;
    this.error_message.set(null);
  }

  protected add_clinic(): void {
    this.model.update((model) => ({
      ...model,
      clinics: [...model.clinics, this.create_clinic()],
    }));
  }

  protected remove_clinic(index: number): void {
    if (this.model().clinics.length <= 1) return;
    this.model.update((model) => ({
      ...model,
      clinics: model.clinics.filter((_, item_index) => item_index !== index),
    }));

    const shifted_files = new Map<number, File>();
    for (const [file_index, file] of this.clinic_images) {
      if (file_index < index) shifted_files.set(file_index, file);
      if (file_index > index) shifted_files.set(file_index - 1, file);
    }
    this.clinic_images = shifted_files;
  }

  protected save(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.error_message.set(null);
    const model = this.model();
    const active_roles = model.roles.filter(
      (role) => role.name.trim() || role.permissionIds.length > 0,
    );
    if (active_roles.some((role) => !role.name.trim())) {
      this.error_message.set('startup.roleNameRequired');
      this.step.set(2);
      return;
    }
    const normalized_role_names = active_roles.map((role) =>
      role.name.trim().toLocaleLowerCase(),
    );
    if (new Set(normalized_role_names).size !== normalized_role_names.length) {
      this.error_message.set(null);
      this.step.set(2);
      return;
    }
    const clinic_values = model.clinics;
    if (clinic_values.some((clinic) => !clinic.name.trim())) {
      this.error_message.set('startup.clinicNameRequired');
      return;
    }

    const specialties = this.unique_names(model.specialtyNames);
    const specialty_images = new Map<number, File>();
    for (const [source_index, file] of this.specialty_images) {
      const name = model.specialtyNames[source_index]?.trim();
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
      briefDescription: model.briefDescription.trim() || undefined,
      profileImageUrl: model.profileImageUrl.trim() || undefined,
      email: model.email.trim() || undefined,
      jobTitle: model.jobTitle.trim() || undefined,
      previousWorkingExperiences: this.work_experiences(model.previousExperiences),
      currentWorkingExperiences: this.work_experiences(model.currentExperiences),
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
          this.is_complete.set(true);
        },
        error: (error: unknown) => {
          const error_message = error instanceof ErrorService
            ? error.getErrorMessage()
            : error instanceof Error
              ? error.message
              : 'An unknown error occurred.';
          if (error instanceof ErrorService) error.show();
          else this.error_message.set(error_message);
          this.is_saving.set(false);
        },
        complete: () => this.is_saving.set(false),
      });
  }

  protected permission_is_selected(
    role: FieldTree<RoleModel>,
    permission_id: string,
  ): boolean {
    return role.permissionIds().value().includes(permission_id);
  }

  protected selected_permission_count(
    role: FieldTree<RoleModel>,
    page_group: PermissionPageGroup,
  ): number {
    const selected_ids = new Set(role.permissionIds().value());
    return page_group.permissions.filter((permission) =>
      selected_ids.has(permission.id),
    ).length;
  }

  protected permission_page_is_selected(
    role: FieldTree<RoleModel>,
    page_group: PermissionPageGroup,
  ): boolean {
    return this.selected_permission_count(role, page_group) ===
      page_group.permissions.length;
  }

  protected permission_page_is_indeterminate(
    role: FieldTree<RoleModel>,
    page_group: PermissionPageGroup,
  ): boolean {
    const count = this.selected_permission_count(role, page_group);
    return count > 0 && count < page_group.permissions.length;
  }

  protected toggle_permission(
    role: FieldTree<RoleModel>,
    permission_id: string,
    event: Event,
  ): void {
    const selected_ids = new Set(role.permissionIds().value());
    if ((event.target as HTMLInputElement).checked) {
      selected_ids.add(permission_id);
    } else {
      selected_ids.delete(permission_id);
    }
    role.permissionIds().value.set([...selected_ids]);
  }

  protected toggle_page_permissions(
    role: FieldTree<RoleModel>,
    page_group: PermissionPageGroup,
    event: Event,
  ): void {
    const selected_ids = new Set(role.permissionIds().value());
    for (const permission of page_group.permissions) {
      if ((event.target as HTMLInputElement).checked) {
        selected_ids.add(permission.id);
      } else {
        selected_ids.delete(permission.id);
      }
    }
    role.permissionIds().value.set([...selected_ids]);
  }

  protected clinic_has_specialty(clinic: FieldTree<ClinicModel>, name: string): boolean {
    return clinic.specialties().value().includes(name);
  }

  protected toggle_clinic_specialty(
    clinic: FieldTree<ClinicModel>,
    name: string,
    event: Event,
  ): void {
    const selected_names = new Set(clinic.specialties().value());
    if ((event.target as HTMLInputElement).checked) {
      selected_names.add(name);
    } else {
      selected_names.delete(name);
    }
    clinic.specialties().value.set([...selected_names]);
  }

  private create_experience(): ExperienceModel {
    return { workplace: '', title: '', startDate: '', endDate: '', description: '' };
  }

  private create_certification(): CertificationModel {
    return { name: '', issuer: '', issuedAt: '', certificateUrl: '' };
  }

  private create_clinic(): ClinicModel {
    return { name: '', phone: '', address: '', specialties: [] };
  }

  private work_experiences(rows: ExperienceModel[]): StartupWorkExperience[] {
    return rows
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
    return this.model().certifications.flatMap((row, source_index) => {
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
    return this.model()
      .roles.filter((role) => role.name.trim())
      .map((role) => ({
        name: role.name.trim(),
        description: role.description.trim() || undefined,
        permissionIds: role.permissionIds,
      }));
  }

  private unique_names(names: string[]): string[] {
    return [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  }
}
