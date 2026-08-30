"use client";

import { useState } from "react";
import { Edit2, Save, X, Check } from "lucide-react";
import {
  FormField,
  ErrorAlert,
  LoadingSpinner,
  ProfilePhotoUpload,
  AddressHierarchyFields,
  AddressFormValues,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { formatDisplayDate, getMinMaxDobStrings } from "@/shared/utils/date.util";
import { formatPhoneDisplay } from "@/shared/utils/phone.util";
import { fileToDataUrl } from "@/shared/utils/image.util";
import { useMyTeacherProfile, useUpdateTeacherProfile } from "../hooks/useTeacherProfile";
import { Gender, UpdateTeacherProfilePayload } from "../types/teacher-profile.types";

export function TeacherProfileView() {
  const { data: profile, isLoading, error } = useMyTeacherProfile();
  const updateMutation = useUpdateTeacherProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("FEMALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("Ethiopian");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [addressValues, setAddressValues] = useState<AddressFormValues>({});

  const startEditing = () => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setMiddleName(profile.middleName);
    setLastName(profile.lastName);
    setGender(profile.gender);
    setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] || "" : "");
    setPhoneNumber(profile.phoneNumber || "");
    setEmail(profile.email || "");
    setNationality(profile.nationality || "Ethiopian");
    setPhotoUrl(profile.photoUrl || null);
    setAddressValues({
      regionId: profile.address?.regionName || profile.address?.regionId || "",
      zoneId: profile.address?.zoneName || profile.address?.zoneId || "",
      woredaId: profile.address?.woredaName || profile.address?.woredaId || "",
      cityId: profile.address?.cityName || profile.address?.cityId || "",
      kebeleId: profile.address?.kebeleName || profile.address?.kebeleId || "",
      specificLocation: profile.address?.specificLocation || "",
    });
    setSavedSuccess(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSavedSuccess(false);
  };

  const handleAddressChange = (field: keyof AddressFormValues, val: string) => {
    setAddressValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    const payload: UpdateTeacherProfilePayload = {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      phoneNumber: phoneNumber.trim() || null,
      email: email.trim() || null,
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
    };

    await updateMutation.mutateAsync(payload, {
      onSuccess: () => {
        setSavedSuccess(true);
        setTimeout(() => {
          setIsEditing(false);
          setSavedSuccess(false);
        }, 800);
      },
    });
  };

  const { minDate, maxDate } = getMinMaxDobStrings(18, 100);

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <LoadingSpinner size={24} />
        <p className="text-xs text-muted-foreground">Loading profile details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <ErrorAlert
        message={getErrorMessage(
          error,
          "Failed to load profile details. Please try again."
        )}
      />
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {updateMutation.error && (
        <ErrorAlert
          message={getErrorMessage(
            updateMutation.error,
            "Failed to save profile updates."
          )}
        />
      )}

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xl sm:text-2xl overflow-hidden shrink-0">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {profile.firstName[0]}
                  {profile.middleName[0]}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  {profile.fullName}
                </h1>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-2xs">
                  Teacher
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap font-mono">
                <span className="font-semibold text-foreground">{profile.employeeCode}</span>
                <span>•</span>
                <span>Username: {profile.username}</span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <Edit2 size={14} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={updateMutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 text-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>Saved</span>
                  </>
                ) : updateMutation.isPending ? (
                  <>
                    <LoadingSpinner size={14} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Personal & Demographics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  First Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.firstName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Middle Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.middleName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Last Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.lastName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Gender
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block uppercase">
                  {profile.gender}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Date of Birth
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formatDisplayDate(profile.dateOfBirth) || "Not registered"}
                </span>
              </div>

              {profile.age !== null && (
                <div className="p-3.5 rounded-xl border border-border bg-background/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Age
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    {profile.age} years
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Nationality
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.nationality || "Ethiopian"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="text-sm font-medium text-foreground font-mono mt-1 block">
                  {formatPhoneDisplay(profile.phoneNumber || "") || "Not registered"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block truncate">
                  {profile.email || "Not registered"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Verification Status
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.emailVerified ? "Verified Account" : "Pending Verification"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Registered On
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formatDisplayDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Residential Address
            </h2>

            {profile.address ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {(profile.address.regionName || profile.address.regionId) && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Region
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {profile.address.regionName || profile.address.regionId}
                    </span>
                  </div>
                )}

                {(profile.address.zoneName || profile.address.zoneId) && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Zone
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {profile.address.zoneName || profile.address.zoneId}
                    </span>
                  </div>
                )}

                {(profile.address.woredaName || profile.address.woredaId) && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Woreda
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {profile.address.woredaName || profile.address.woredaId}
                    </span>
                  </div>
                )}

                {(profile.address.cityName || profile.address.cityId) && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      City
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {profile.address.cityName || profile.address.cityId}
                    </span>
                  </div>
                )}

                {(profile.address.kebeleName || profile.address.kebeleId) && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Kebele
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {profile.address.kebeleName || profile.address.kebeleId}
                    </span>
                  </div>
                )}

                {profile.address.specificLocation && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Current Location
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {profile.address.specificLocation}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No residential address registered. Click Edit Profile to add your address details.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-foreground">
              Edit Profile Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your personal demographics, contact details, and residential location.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profile Photo
            </h3>
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
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <FormField
                id="editFirstName"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <FormField
                id="editMiddleName"
                label="Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <FormField
                id="editLastName"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="h-11 sm:h-12 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-medium text-foreground focus-visible:bg-background focus-visible:border-foreground/40 focus-visible:outline-hidden"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
              </div>

              <FormField
                id="editDob"
                label="Date of Birth"
                type="date"
                min={minDate}
                max={maxDate}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />

              <FormField
                id="editNationality"
                label="Nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                id="editPhone"
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0911223344"
              />
              <FormField
                id="editEmail"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@school.edu.et"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Residential Location
            </h3>
            <AddressHierarchyFields
              values={addressValues}
              onChange={handleAddressChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
