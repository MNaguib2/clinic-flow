import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@core/config/app.config';
import type {
  StartupOptions,
  StartupPayload,
  StartupResult,
} from '@core/interfaces/startup.interfaces';

@Injectable()
export class StartupService {
  private readonly http = inject(HttpClient);
  private readonly api_url = inject(API_URL);

  getOptions() {
    return this.http.get<StartupOptions>(
      `${this.api_url}/organizations/startup/options`,
    );
  }

  complete(
    payload: StartupPayload,
    profile_image: File | null,
    organization_logo: File | null,
    certification_files: ReadonlyMap<number, File>,
    clinic_images: ReadonlyMap<number, File> = new Map(),
  ) {
    const form_data = new FormData();
    form_data.append('data', JSON.stringify(payload));
    if (profile_image) form_data.append('profileImage', profile_image);
    if (organization_logo) form_data.append('organizationLogo', organization_logo);
    for (const [index, file] of certification_files) {
      form_data.append(`certificationFile_${index}`, file);
    }
    for (const [index, file] of clinic_images) {
      form_data.append(`clinicImage_${index}`, file);
    }
    return this.http.post<StartupResult>(
      `${this.api_url}/organizations/startup`,
      form_data,
    );
  }
}
