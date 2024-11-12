export class SiteSettingDto {
  aboutUs?: string;

  privacyPolicy?: string;

  termsAndConditions?: string;

  contactInfo?: number;

  constructor(partial: Partial<SiteSettingDto> = {}) {
    Object.assign(this, partial);
  }
}
