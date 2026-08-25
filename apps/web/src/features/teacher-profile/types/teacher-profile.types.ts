export type Gender = "MALE" | "FEMALE";
export type TeacherStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type AccountStatus =
  | "PENDING_FIRST_LOGIN"
  | "ACTIVE"
  | "SUSPENDED"
  | "LOCKED"
  | "DEACTIVATED";

export interface AddressData {
  readonly regionId?: string | null;
  readonly zoneId?: string | null;
  readonly woredaId?: string | null;
  readonly kebeleId?: string | null;
  readonly cityId?: string | null;
  readonly subCityId?: string | null;
  readonly specificLocation?: string | null;
}

export interface AddressDetail extends AddressData {
  readonly id: string;
  readonly regionName?: string | null;
  readonly zoneName?: string | null;
  readonly woredaName?: string | null;
  readonly kebeleName?: string | null;
  readonly cityName?: string | null;
  readonly subCityName?: string | null;
  readonly formattedAddress?: string;
}

export interface CompleteTeacherProfilePayload {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly dateOfBirth: string | Date;
  readonly phoneNumber?: string | null;
  readonly email?: string | null;
  readonly nationality?: string | null;
  readonly photoUrl?: string | null;
  readonly address?: AddressData | null;
}

export interface UpdateTeacherProfilePayload {
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly gender?: Gender;
  readonly dateOfBirth?: string | Date | null;
  readonly phoneNumber?: string | null;
  readonly email?: string | null;
  readonly nationality?: string | null;
  readonly photoUrl?: string | null;
  readonly address?: AddressData | null;
}

export interface TeacherProfileDetail {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string | null;
  readonly employeeCode: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly gender: Gender;
  readonly dateOfBirth: string | null;
  readonly age: number | null;
  readonly phoneNumber: string | null;
  readonly email: string | null;
  readonly status: TeacherStatus;
  readonly accountStatus: AccountStatus | null;
  readonly username: string | null;
  readonly emailVerified: boolean;
  readonly address: AddressDetail | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
