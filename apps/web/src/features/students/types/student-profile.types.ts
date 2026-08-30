export type Gender = "MALE" | "FEMALE";

export type StudentStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "GRADUATED"
  | "TRANSFERRED"
  | "WITHDRAWN"
  | "SUSPENDED";

export type ContactRelationship =
  | "FATHER"
  | "MOTHER"
  | "GUARDIAN"
  | "OTHER";

export interface AddressData {
  readonly regionId?: string | null;
  readonly zoneId?: string | null;
  readonly woredaId?: string | null;
  readonly kebeleId?: string | null;
  readonly cityId?: string | null;
  readonly specificLocation?: string | null;
}

export interface AddressDetail extends AddressData {
  readonly id: string;
  readonly regionName?: string | null;
  readonly zoneName?: string | null;
  readonly woredaName?: string | null;
  readonly kebeleName?: string | null;
  readonly cityName?: string | null;
  readonly formattedAddress?: string;
}

export interface StudentContactData {
  readonly fullName: string;
  readonly relationship: ContactRelationship;
  readonly phoneNumber: string;
  readonly alternativePhoneNumber?: string | null;
  readonly isPrimary?: boolean;
  readonly isEmergencyContact?: boolean;
  readonly address?: AddressData | null;
}

export interface StudentContactDetail {
  readonly id: string;
  readonly contactId: string;
  readonly fullName: string;
  readonly relationship: ContactRelationship;
  readonly phoneNumber: string;
  readonly alternativePhoneNumber?: string | null;
  readonly isPrimary: boolean;
  readonly isEmergencyContact: boolean;
  readonly address?: AddressDetail | null;
}

export interface StudentEnrollmentDetail {
  readonly id: string;
  readonly academicYearId: string;
  readonly academicYearName: string;
  readonly gradeLevel: number;
  readonly sectionId: string;
  readonly sectionName: string;
  readonly status: string;
}

export interface CompleteStudentProfilePayload {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName?: string | null;
  readonly gender: Gender;
  readonly dateOfBirth: Date | string;
  readonly nationality?: string | null;
  readonly photoUrl?: string | null;
  readonly address?: AddressData | null;
  readonly contacts?: readonly StudentContactData[];
}

export interface UpdateStudentProfilePayload {
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string | null;
  readonly gender?: Gender;
  readonly dateOfBirth?: Date | string | null;
  readonly nationality?: string | null;
  readonly photoUrl?: string | null;
  readonly address?: AddressData | null;
  readonly contacts?: readonly StudentContactData[];
}

export interface StudentProfileDetail {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string | null;
  readonly studentCode: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string | null;
  readonly fullName: string;
  readonly gender: Gender;
  readonly dateOfBirth: string | null;
  readonly age: number | null;
  readonly nationality?: string | null;
  readonly photoUrl?: string | null;
  readonly status: StudentStatus;
  readonly accountStatus: string | null;
  readonly username: string | null;
  readonly email: string | null;
  readonly address: AddressDetail | null;
  readonly contacts: readonly StudentContactDetail[];
  readonly enrollment: StudentEnrollmentDetail | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
