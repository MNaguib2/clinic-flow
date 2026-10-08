export interface IUserRequest {
  id: bigint;
  organizationId: bigint;
  fullName: string;
  phoneNumber: string | null;
}
