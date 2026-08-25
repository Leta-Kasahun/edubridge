"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  FormField,
  SubmitButton,
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
import { ROUTES } from "@/constants/routes";
import {
  useMyTeacherProfile,
  useCompleteTeacherProfile,
} from "../hooks/useTeacherProfile";
import {
  TeacherProfileDetail,
  Gender,
  CompleteTeacherProfilePayload,
} from "../types/teacher-profile.types";

const ONBOARDING_STEPS: readonly StepItem[] = [
  { id: 1, title: "Personal Details", description: "Identity & Demographics" },
  { id: 2, title: "Contact & Address", description: "Phone & Location" },
  { id: 3, title: "Review & Confirm", description: "Verify Information" },
];

export interface TeacherOnboardingWizardProps {
  readonly initialProfile?: TeacherProfileDetail | null;
  readonly onSuccess?: () => void;
}

export function TeacherOnboardingWizard({
  initialProfile,
  onSuccess,
}: TeacherOnboardingWizardProps) {
  const router = useRouter();
  const { data: fetchedProfile } = useMyTeacherProfile(!initialProfile);
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
  const [nationality, setNationality] = useState("Ethiopian");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || "");
  const [email, setEmail] = useState(profile?.email || "");

  const [addressValues, setAddressValues] = useState<AddressFormValues>({
    specificLocation: profile?.address?.specificLocation || "",
    cityId: profile?.address?.cityName || profile?.address?.cityId || "",
    subCityId: profile?.address?.subCityName || profile?.address?.subCityId || "",
    regionId: profile?.address?.regionName || profile?.address?.regionId || "",
    zoneId: profile?.address?.zoneName || profile?.address?.zoneId || "",
    woredaId: profile?.address?.woredaName || profile?.address?.woredaId || "",
    kebeleId: profile?.address?.kebeleName || profile?.address?.kebeleId || "",
  });

  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.middleName) setMiddleName(profile.middleName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.gender) setGender(profile.gender);
      if (profile.dateOfBirth) setDateOfBirth(profile.dateOfBirth.split("T")[0] || "");
      if (profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
      if (profile.email) setEmail(profile.email);
      if (profile.address) {
        setAddressValues({
          specificLocation: profile.address.specificLocation || "",
          cityId: profile.address.cityName || profile.address.cityId || "",
          subCityId: profile.address.subCityName || profile.address.subCityId || "",
          regionId: profile.address.regionName || profile.address.regionId || "",
          zoneId: profile.address.zoneName || profile.address.zoneId || "",
          woredaId: profile.address.woredaName || profile.address.woredaId || "",
          kebeleId: profile.address.kebeleName || profile.address.kebeleId || "",
        });
      }
    }
  }, [profile]);

  const { minDate, maxDate } = getMinMaxDobStrings(18, 100);
  const completeMutation = useCompleteTeacherProfile();

  const handleAddressChange = (field: keyof AddressFormValues, val: string) => {
    setAddressValues((prev) => ({ ...prev, [field]: val }));
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!middleName.trim()) errors.middleName = "Middle name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (phoneNumber && !/^\+?[0-9\s-]{9,20}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = "Invalid phone number format";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Invalid email format";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    const payload: CompleteTeacherProfilePayload = {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth: new Date(dateOfBirth),
      phoneNumber: phoneNumber.trim() || null,
      email: email.trim() || null,
      nationality: nationality.trim() || null,
      photoUrl: photoUrl || null,
      address: {
        specificLocation: addressValues.specificLocation?.trim() || null,
        cityId: addressValues.cityId?.trim() || null,
        subCityId: addressValues.subCityId?.trim() || null,
        regionId: addressValues.regionId?.trim() || null,
        zoneId: addressValues.zoneId?.trim() || null,
        woredaId: addressValues.woredaId?.trim() || null,
        kebeleId: addressValues.kebeleId?.trim() || null,
      },
    };

    await completeMutation.mutateAsync(payload, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      },
    });
  };

  const reviewSections: readonly ReviewSection[] = [
    {
      title: "Personal & Identity Information",
      onEdit: () => setCurrentStep(1),
      items: [
        { label: "Full Name", value: `${firstName} ${middleName} ${lastName}` },
        { label: "Gender", value: gender },
        { label: "Date of Birth", value: formatDisplayDate(dateOfBirth) },
        { label: "Nationality", value: nationality || "Ethiopian" },
      ],
    },
    {
      title: "Contact & Address Information",
      onEdit: () => setCurrentStep(2),
      items: [
        { label: "Phone Number", value: formatPhoneDisplay(phoneNumber) || "Not registered" },
        { label: "Email Address", value: email || "Not registered" },
        { label: "Specific Location", value: addressValues.specificLocation || "Not provided" },
        { label: "City / Town", value: addressValues.cityId || "Not provided" },
        { label: "Sub-City", value: addressValues.subCityId || "Not provided" },
        { label: "Region", value: addressValues.regionId || "Not provided" },
      ],
    },
  ];

  return (
    <OnboardingLayout
      title="Teacher Profile Onboarding"
      subtitle="Complete your faculty profile details to activate your dashboard and academic workspace"
      stepper={
        <OnboardingStepper
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step === 1 || (step === 2 && validateStep1())) {
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
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Step 1: Personal & Demographics
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify and complete your official legal name and demographic details.
              </p>
            </div>

            <ProfilePhotoUpload
              initialPhotoUrl={photoUrl}
              onPhotoSelect={(file) => {
                if (file) {
                  setPhotoUrl(URL.createObjectURL(file));
                } else {
                  setPhotoUrl(null);
                }
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <FormField
                id="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={validationErrors.firstName}
                placeholder="First name"
                required
              />

              <FormField
                id="middleName"
                label="Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                error={validationErrors.middleName}
                placeholder="Father's name"
                required
              />

              <FormField
                id="lastName"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={validationErrors.lastName}
                placeholder="Grandfather's name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="h-11 sm:h-12 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-medium text-foreground focus-visible:bg-background focus-visible:border-foreground/40 focus-visible:outline-hidden"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
              </div>

              <FormField
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                min={minDate}
                max={maxDate}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                error={validationErrors.dateOfBirth}
                required
              />

              <FormField
                id="nationality"
                label="Nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g., Ethiopian"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Step 2: Contact & Residential Address
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provide your primary contact and residence details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={validationErrors.phoneNumber}
                placeholder="e.g., 0911223344 or +251911223344"
              />

              <FormField
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={validationErrors.email}
                placeholder="e.g., name@school.edu.et"
              />
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Residential Location
              </h3>
              <AddressHierarchyFields
                values={addressValues}
                onChange={handleAddressChange}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Step 3: Review & Final Confirmation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please review all information carefully. Click Edit on any section to modify before submitting.
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <SubmitButton
              type="button"
              onClick={handleNext}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              Continue
            </SubmitButton>
          ) : (
            <SubmitButton
              type="button"
              onClick={handleSubmit}
              isLoading={completeMutation.isPending}
              loadingText="Activating Dashboard..."
              icon={<CheckCircle2 size={16} />}
              iconPosition="right"
            >
              Confirm & Complete
            </SubmitButton>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
