"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit2, Save, X, User, Check } from "lucide-react";
import {
  FormField,
  ErrorAlert,
  LoadingSpinner,
  AddressHierarchyFields,
  AddressFormValues,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { formatDisplayDate, getMinMaxDobStrings } from "@/shared/utils/date.util";
import { formatPhoneDisplay } from "@/shared/utils/phone.util";
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
    setAddressValues({
      specificLocation: profile.address?.specificLocation || "",
      cityId: profile.address?.cityName || profile.address?.cityId || "",
      subCityId: profile.address?.subCityName || profile.address?.subCityId || "",
      regionId: profile.address?.regionName || profile.address?.regionId || "",
      zoneId: profile.address?.zoneName || profile.address?.zoneId || "",
      woredaId: profile.address?.woredaName || profile.address?.woredaId || "",
      kebeleId: profile.address?.kebeleName || profile.address?.kebeleId || "",
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
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {updateMutation.error && (
        <ErrorAlert
          message={getErrorMessage(
            updateMutation.error,
            "Failed to save profile updates."
          )}
        />
      )}

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {profile.photoUrl ? (
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-border shrink-0">
              <Image
                src={profile.photoUrl}
                alt={profile.fullName}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
              <User size={24} />
            </div>
          )}

          <div className="space-y-0.5 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
              {profile.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>{profile.employeeCode}</span>
              <span>•</span>
              <span>Username: {profile.username}</span>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 text-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 text-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
            >
              <X size={14} />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
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

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Personal & Demographics
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">First Name</span>
                <span className="font-medium text-foreground">{profile.firstName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Middle Name</span>
                <span className="font-medium text-foreground">{profile.middleName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Name</span>
                <span className="font-medium text-foreground">{profile.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-medium text-foreground uppercase">{profile.gender}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="font-medium text-foreground">
                  {formatDisplayDate(profile.dateOfBirth) || "Not registered"}
                </span>
              </div>
              {profile.age !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Calculated Age</span>
                  <span className="font-medium text-foreground">{profile.age} years</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Contact Details
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="font-medium text-foreground font-mono">
                  {formatPhoneDisplay(profile.phoneNumber || "") || "Not registered"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email Address</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {profile.email || "Not registered"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification</span>
                <span className="font-medium text-foreground">
                  {profile.emailVerified ? "Verified Account" : "Pending Verification"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registered On</span>
                <span className="font-medium text-foreground">
                  {formatDisplayDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs sm:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Residential Address
            </h2>

            {profile.address?.formattedAddress ? (
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {profile.address.formattedAddress}
              </p>
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
