"use client";

import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import {
  FormField,
  SubmitButton,
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
    setAddressValues({
      specificLocation: profile.address?.specificLocation || "",
      cityId: profile.address?.cityName || profile.address?.cityId || "",
      subCityId: profile.address?.subCityName || profile.address?.subCityId || "",
      regionId: profile.address?.regionName || profile.address?.regionId || "",
      zoneId: profile.address?.zoneName || profile.address?.zoneId || "",
      woredaId: profile.address?.woredaName || profile.address?.woredaId || "",
      kebeleId: profile.address?.kebeleName || profile.address?.kebeleId || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
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
        setIsEditing(false);
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

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              {profile.fullName}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200">
              {profile.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{profile.employeeCode}</span>
            <span>•</span>
            <span>Username: {profile.username}</span>
            <span>•</span>
            <span className="font-sans">
              {profile.emailVerified ? "Verified Account" : "Pending Verification"}
            </span>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Edit2 size={14} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={cancelEditing}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
            <SubmitButton
              onClick={handleSave}
              isLoading={updateMutation.isPending}
              icon={<Check size={14} />}
              className="h-9 px-3.5 text-xs"
            >
              Save
            </SubmitButton>
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
                <span className="text-muted-foreground">Account Status</span>
                <span className="font-medium text-foreground">
                  {profile.accountStatus || "Active"}
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
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Edit Personal & Contact Information
            </h2>

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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
              Edit Residential Location
            </h2>
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
