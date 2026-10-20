"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, User } from "lucide-react";
import {
  FormField,
  DatePicker,
  LoadingSpinner,
  ErrorAlert,
  OnboardingLayout,
  OnboardingStepper,
  ProfilePhotoUpload,
  AddressHierarchyFields,
  OnboardingStepReview,
  StepItem,
  ReviewSection,
  AddressFormValues,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { getMinMaxDobStrings, formatDisplayDate } from "@/shared/utils/date.util";
import { formatPhoneDisplay } from "@/shared/utils/phone.util";
import { fileToDataUrl } from "@/shared/utils/image.util";
import { ROUTES } from "@/constants/routes";
import {
  useMyStudentProfile,
  useCompleteStudentProfile,
} from "../hooks/useStudentProfile";
import {
  StudentProfileDetail,
  Gender,
  ContactRelationship,
  CompleteStudentProfilePayload,
} from "../types/student-profile.types";

const ONBOARDING_STEPS: readonly StepItem[] = [
  { id: 1, title: "Personal Details", description: "Identity & Demographics" },
  { id: 2, title: "Parent Contact", description: "Primary Contact Info" },
  { id: 3, title: "Residential Address", description: "Location & Residence" },
  { id: 4, title: "Review & Confirm", description: "Verify All Details" },
];

export interface StudentOnboardingWizardProps {
  readonly initialProfile?: StudentProfileDetail | null;
  readonly onSuccess?: () => void;
}

export function StudentOnboardingWizard({
  initialProfile,
  onSuccess,
}: StudentOnboardingWizardProps) {
  const router = useRouter();
  const { data: fetchedProfile } = useMyStudentProfile(!initialProfile);
  const profile = initialProfile || fetchedProfile;

  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [middleName, setMiddleName] = useState(profile?.middleName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [gender, setGender] = useState<Gender>(profile?.gender || "FEMALE");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth ? profile.dateOfBirth.split("T")[0] || "" : ""
  );
  const [nationality, setNationality] = useState(profile?.nationality || "Ethiopian");
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile?.photoUrl || null);

  const existingPrimaryContact = profile?.contacts?.find((c) => c.isPrimary) || profile?.contacts?.[0];

  const [contactName, setContactName] = useState(existingPrimaryContact?.fullName || "");
  const [contactRelationship, setContactRelationship] = useState<ContactRelationship>(
    existingPrimaryContact?.relationship || "FATHER"
  );
  const [contactPhone, setContactPhone] = useState(existingPrimaryContact?.phoneNumber || "");
  const [contactAltPhone, setContactAltPhone] = useState(existingPrimaryContact?.alternativePhoneNumber || "");
  const [isEmergencyContact, setIsEmergencyContact] = useState(
    existingPrimaryContact?.isEmergencyContact ?? true
  );

  const [addressValues, setAddressValues] = useState<AddressFormValues>({
    regionId: profile?.address?.regionName || profile?.address?.regionId || "",
    zoneId: profile?.address?.zoneName || profile?.address?.zoneId || "",
    woredaId: profile?.address?.woredaName || profile?.address?.woredaId || "",
    cityId: profile?.address?.cityName || profile?.address?.cityId || "",
    kebeleId: profile?.address?.kebeleName || profile?.address?.kebeleId || "",
    specificLocation: profile?.address?.specificLocation || "",
  });

  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.middleName) setMiddleName(profile.middleName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.gender) setGender(profile.gender);
      if (profile.dateOfBirth) setDateOfBirth(profile.dateOfBirth.split("T")[0] || "");
      if (profile.nationality) setNationality(profile.nationality);
      if (profile.photoUrl) setPhotoUrl(profile.photoUrl);

      const primaryContact = profile.contacts?.find((c) => c.isPrimary) || profile.contacts?.[0];
      if (primaryContact) {
        if (primaryContact.fullName) setContactName(primaryContact.fullName);
        if (primaryContact.relationship) setContactRelationship(primaryContact.relationship);
        if (primaryContact.phoneNumber) setContactPhone(primaryContact.phoneNumber);
        if (primaryContact.alternativePhoneNumber) setContactAltPhone(primaryContact.alternativePhoneNumber);
        setIsEmergencyContact(primaryContact.isEmergencyContact ?? true);
      }

      if (profile.address) {
        setAddressValues({
          regionId: profile.address.regionName || profile.address.regionId || "",
          zoneId: profile.address.zoneName || profile.address.zoneId || "",
          woredaId: profile.address.woredaName || profile.address.woredaId || "",
          cityId: profile.address.cityName || profile.address.cityId || "",
          kebeleId: profile.address.kebeleName || profile.address.kebeleId || "",
          specificLocation: profile.address.specificLocation || "",
        });
      }
    }
  }, [profile]);

  const { minDate, maxDate } = getMinMaxDobStrings(3, 40);
  const completeMutation = useCompleteStudentProfile();

  const handleAddressChange = (field: keyof AddressFormValues, val: string) => {
    setAddressValues((prev) => ({ ...prev, [field]: val }));
  };

  const clearFieldError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "Please enter your first name";
    if (!middleName.trim()) errors.middleName = "Please enter your middle name";
    if (!dateOfBirth) errors.dateOfBirth = "Please select your date of birth";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!contactName.trim()) errors.contactName = "Please enter parent full name";
    if (!contactPhone.trim()) {
      errors.contactPhone = "Please enter parent phone number";
    } else if (!/^\+?[0-9\s-]{9,20}$/.test(contactPhone.trim())) {
      errors.contactPhone = "Please enter a valid phone number (e.g. 0911223344)";
    }
    if (contactAltPhone.trim() && !/^\+?[0-9\s-]{9,20}$/.test(contactAltPhone.trim())) {
      errors.contactAltPhone = "Please enter a valid alternative phone number";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    const payload: CompleteStudentProfilePayload = {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim() || null,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      nationality: nationality.trim() || null,
      photoUrl: photoUrl || null,
      address: {
        regionId: addressValues.regionId?.trim() || null,
        zoneId: addressValues.zoneId?.trim() || null,
        woredaId: addressValues.woredaId?.trim() || null,
        cityId: addressValues.cityId?.trim() || null,
        kebeleId: addressValues.kebeleId?.trim() || null,
        specificLocation: addressValues.specificLocation?.trim() || null,
      },
      contacts: contactName.trim()
        ? [
            {
              fullName: contactName.trim(),
              relationship: contactRelationship,
              phoneNumber: contactPhone.trim(),
              alternativePhoneNumber: contactAltPhone.trim() || null,
              isPrimary: true,
              isEmergencyContact,
            },
          ]
        : [],
    };

    await completeMutation.mutateAsync(payload, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(ROUTES.STUDENT.PROFILE);
        }
      },
    });
  };

  const reviewSections: readonly ReviewSection[] = [
    {
      title: "Personal & Identity Information",
      onEdit: () => setCurrentStep(1),
      items: [
        { label: "Full Name", value: [firstName, middleName, lastName].filter(Boolean).join(" ") },
        { label: "Student Code", value: profile?.studentCode || "Auto-assigned" },
        { label: "Gender", value: gender },
        { label: "Date of Birth", value: formatDisplayDate(dateOfBirth) },
        { label: "Nationality", value: nationality || "Ethiopian" },
      ],
    },
    {
      title: "Parent Contact",
      onEdit: () => setCurrentStep(2),
      items: [
        { label: "Contact Name", value: contactName || "Not provided" },
        { label: "Relationship", value: contactRelationship },
        { label: "Primary Phone", value: formatPhoneDisplay(contactPhone) || "Not provided" },
        { label: "Alternative Phone", value: formatPhoneDisplay(contactAltPhone) || "Not provided" },
        { label: "Emergency Contact", value: isEmergencyContact ? "Yes" : "No" },
      ],
    },
    {
      title: "Residential Address",
      onEdit: () => setCurrentStep(3),
      items: [
        { label: "Region", value: addressValues.regionId || "Not provided" },
        { label: "Zone", value: addressValues.zoneId || "Not provided" },
        { label: "Woreda", value: addressValues.woredaId || "Not provided" },
        { label: "City", value: addressValues.cityId || "Not provided" },
        { label: "Kebele", value: addressValues.kebeleId || "Not provided" },
        { label: "Current Location", value: addressValues.specificLocation || "Not provided" },
      ],
    },
  ];

  return (
    <OnboardingLayout
      title="Student Profile Setup"
      subtitle="Complete your profile details"
      stepper={
        <OnboardingStepper
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (
              step === 1 ||
              (step === 2 && validateStep1()) ||
              (step === 3 && validateStep1() && validateStep2()) ||
              (step === 4 && validateStep1() && validateStep2())
            ) {
              setCurrentStep(step);
            }
          }}
        />
      }
    >
      <div className="space-y-6">
        {completeMutation.error && (
          <ErrorAlert
            message={getErrorMessage(
              completeMutation.error,
              "Failed to complete profile onboarding. Please review your entries and try again."
            )}
          />
        )}

        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Personal Information
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify your name and provide your date of birth and demographic details.
              </p>
            </div>

            <ProfilePhotoUpload
              key={photoUrl ?? "empty"}
              initialPhotoUrl={photoUrl}
              onPhotoSelect={async (file) => {
                if (file) {
                  try {
                    const dataUrl = await fileToDataUrl(file);
                    setPhotoUrl(dataUrl);
                  } catch {
                    setPhotoUrl(URL.createObjectURL(file));
                  }
                } else {
                  setPhotoUrl(null);
                }
              }}
            />

            <FormField
              id="nationality"
              label="Nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g., Ethiopian"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <FormField
                id="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
                onBlur={() => { if (!firstName.trim()) setValidationErrors((prev) => ({ ...prev, firstName: "Please enter your first name" })); }}
                error={validationErrors.firstName}
                placeholder="First name"
                required
              />

              <FormField
                id="middleName"
                label="Middle Name"
                value={middleName}
                onChange={(e) => { setMiddleName(e.target.value); clearFieldError("middleName"); }}
                onBlur={() => { if (!middleName.trim()) setValidationErrors((prev) => ({ ...prev, middleName: "Please enter your middle name" })); }}
                error={validationErrors.middleName}
                placeholder="Middle name"
                required
              />

              <FormField
                id="lastName"
                label="Last Name (Optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block select-none"
                >
                  Gender <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5 h-11 sm:h-12">
                  <button
                    type="button"
                    onClick={() => setGender("FEMALE")}
                    className={`rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] ${
                      gender === "FEMALE"
                        ? "border-2 border-primary text-primary bg-primary/5 font-bold shadow-xs"
                        : "border border-input text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
                    }`}
                  >
                    <User size={16} className="shrink-0" />
                    <span>Female</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("MALE")}
                    className={`rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] ${
                      gender === "MALE"
                        ? "border-2 border-primary text-primary bg-primary/5 font-bold shadow-xs"
                        : "border border-input text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
                    }`}
                  >
                    <User size={16} className="shrink-0" />
                    <span>Male</span>
                  </button>
                </div>
              </div>

              <DatePicker
                id="dateOfBirth"
                label="Date of Birth"
                min={minDate}
                max={maxDate}
                value={dateOfBirth}
                onChange={(val) => {
                  setDateOfBirth(val);
                  clearFieldError("dateOfBirth");
                }}
                error={validationErrors.dateOfBirth}
                required
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Parent Contact
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provide contact information for your parent for school communications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                id="contactName"
                label="Parent Full Name"
                value={contactName}
                onChange={(e) => { setContactName(e.target.value); clearFieldError("contactName"); }}
                error={validationErrors.contactName}
                placeholder="e.g. Kebede Tessema"
                required
              />

              <div className="space-y-2">
                <label
                  htmlFor="contactRelationship"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block"
                >
                  Relationship *
                </label>
                <select
                  id="contactRelationship"
                  value={contactRelationship}
                  onChange={(e) => setContactRelationship(e.target.value as ContactRelationship)}
                  className="h-11 sm:h-12 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-foreground/40 focus:bg-background transition-colors"
                >
                  <option value="FATHER">Father</option>
                  <option value="MOTHER">Mother</option>
                  <option value="OTHER">Parent / Other</option>
                </select>
              </div>

              <FormField
                id="contactPhone"
                label="Primary Phone Number"
                type="tel"
                value={contactPhone}
                onChange={(e) => { setContactPhone(e.target.value); clearFieldError("contactPhone"); }}
                error={validationErrors.contactPhone}
                placeholder="e.g., 0911223344 or +251911223344"
                required
              />

              <FormField
                id="contactAltPhone"
                label="Alternative Phone (Optional)"
                type="tel"
                value={contactAltPhone}
                onChange={(e) => { setContactAltPhone(e.target.value); clearFieldError("contactAltPhone"); }}
                error={validationErrors.contactAltPhone}
                placeholder="e.g., 0922334455"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-background/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergencyContact}
                  onChange={(e) => setIsEmergencyContact(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Designate as emergency contact
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    School will reach this contact in emergency situations
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Residential Location
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provide your current residence address in Ethiopia.
              </p>
            </div>

            <AddressHierarchyFields
              values={addressValues}
              onChange={handleAddressChange}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Review & Confirm
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review all your information before submitting. You can edit any section by clicking the edit button.
              </p>
            </div>

            <OnboardingStepReview sections={reviewSections} />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 text-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={completeMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
            >
              {completeMutation.isPending ? (
                <>
                  <LoadingSpinner size={14} />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Confirm & Complete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
