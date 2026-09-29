"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Edit2,
  Save,
  X,
  Check,
  User,
  Phone,
  MapPin,
  Award,
  BookOpen,
  School,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
} from "lucide-react";
import {
  FormField,
  ErrorAlert,
  LoadingSpinner,
  ProfilePhotoUpload,
  AddressHierarchyFields,
  AddressFormValues,
  DatePicker,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { formatDisplayDate, getMinMaxDobStrings } from "@/shared/utils/date.util";
import { formatPhoneDisplay } from "@/shared/utils/phone.util";
import { fileToDataUrl } from "@/shared/utils/image.util";
import { useMyTeacherProfile, useUpdateTeacherProfile } from "../hooks/useTeacherProfile";
import { useMyTeacherQualifications } from "../hooks/useTeacherQualifications";
import { useMyTeacherExperiences } from "../hooks/useTeacherExperience";
import { useTeacherClasses } from "@/features/classes/hooks/useTeacherClasses";
import { Gender, UpdateTeacherProfilePayload } from "../types/teacher-profile.types";
import { TeacherQualificationsView } from "./TeacherQualificationsView";
import { formatCapacityUtilization } from "@/shared/utils/section.util";
import { ROUTES } from "@/constants/routes";

type ProfileTab = "personal" | "qualifications" | "teaching";

export function TeacherProfileView() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const { data: profile, isLoading, error } = useMyTeacherProfile();
  const updateMutation = useUpdateTeacherProfile();

  const { data: qualifications = [] } = useMyTeacherQualifications();
  const { data: experiences = [] } = useMyTeacherExperiences();
  const { sections, stats: classStats } = useTeacherClasses();

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
    setActiveTab("personal");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSavedSuccess(false);
  };

  const handleAddressChange = (field: keyof AddressFormValues, val: string) => {
    setAddressValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    const hasAddress = Object.values(addressValues).some(
      (v) => typeof v === "string" && v.trim().length > 0
    );

    const payload: UpdateTeacherProfilePayload = {
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      phoneNumber: phoneNumber.trim() || null,
      email: email.trim() || null,
      nationality: nationality.trim() || null,
      photoUrl: photoUrl || null,
      address: hasAddress
        ? {
            regionId: addressValues.regionId?.trim() || null,
            zoneId: addressValues.zoneId?.trim() || null,
            woredaId: addressValues.woredaId?.trim() || null,
            cityId: addressValues.cityId?.trim() || null,
            kebeleId: addressValues.kebeleId?.trim() || null,
            specificLocation: addressValues.specificLocation?.trim() || null,
          }
        : null,
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
        <LoadingSpinner size={28} />
        <p className="text-xs text-muted-foreground">Loading teacher profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <ErrorAlert
          message={getErrorMessage(
            error,
            "Failed to load profile details. Please try again."
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      {updateMutation.error && (
        <ErrorAlert
          message={getErrorMessage(
            updateMutation.error,
            "Failed to save profile updates."
          )}
        />
      )}

      {/* Header Profile Banner */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xl sm:text-2xl overflow-hidden shrink-0 shadow-2xs">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {profile.firstName[0]}
                  {profile.middleName[0] || profile.lastName[0] || "T"}
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
                {profile.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={12} />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap font-mono">
                <span className="font-semibold text-foreground">{profile.employeeCode}</span>
                {profile.username && (
                  <>
                    <span>•</span>
                    <span>@{profile.username}</span>
                  </>
                )}
                {profile.email && (
                  <>
                    <span>•</span>
                    <span>{profile.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
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
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted/50 text-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
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

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-border/80">
          <div className="p-2.5 sm:p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block truncate">
              Assigned Classes
            </span>
            <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {classStats.totalClasses}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block truncate">
              Students Taught
            </span>
            <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {classStats.totalStudents}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block truncate">
              Qualifications
            </span>
            <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {qualifications.length}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block truncate">
              Work Experiences
            </span>
            <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {experiences.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher (when not in full edit mode) */}
      {!isEditing && (
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "personal"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={13} />
            <span>Personal Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qualifications")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "qualifications"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award size={13} />
            <span>Qualifications & Experience</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("teaching")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "teaching"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <School size={13} />
            <span>Teaching Assignments</span>
          </button>
        </div>
      )}

      {/* Tab 1: Personal Details (View Mode) */}
      {!isEditing && activeTab === "personal" && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <User size={16} className="text-muted-foreground" />
              <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                Personal & Demographics
              </h2>
            </div>

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
                  {profile.middleName || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Last Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.lastName || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Gender
                </span>
                <span className="text-sm font-medium uppercase text-foreground mt-1 block">
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
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Phone size={16} className="text-muted-foreground" />
              <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                Contact & Account Details
              </h2>
            </div>

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
                  Account Status
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Registered Since
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formatDisplayDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MapPin size={16} className="text-muted-foreground" />
              <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                Residential Address
              </h2>
            </div>

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
      )}

      {/* Tab 1: Edit Mode */}
      {isEditing && (
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-foreground">
              Edit Profile Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your personal demographics, contact details, and residential location.
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

          <div className="space-y-4 pt-2 border-t border-border">
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
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block select-none">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2 h-11 sm:h-12">
                  <button
                    type="button"
                    onClick={() => setGender("FEMALE")}
                    className={`rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] ${
                      gender === "FEMALE"
                        ? "border-2 border-primary text-primary bg-primary/5 font-bold shadow-xs"
                        : "border border-input text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
                    }`}
                  >
                    <User size={15} className="shrink-0" />
                    <span>Female</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("MALE")}
                    className={`rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] ${
                      gender === "MALE"
                        ? "border-2 border-primary text-primary bg-primary/5 font-bold shadow-xs"
                        : "border border-input text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
                    }`}
                  >
                    <User size={15} className="shrink-0" />
                    <span>Male</span>
                  </button>
                </div>
              </div>

              <DatePicker
                id="editDob"
                label="Date of Birth"
                min={minDate}
                max={maxDate}
                value={dateOfBirth}
                onChange={setDateOfBirth}
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

      {/* Tab 2: Qualifications & Experience */}
      {!isEditing && activeTab === "qualifications" && (
        <div className="space-y-6">
          <TeacherQualificationsView />
        </div>
      )}

      {/* Tab 3: Teaching Assignments */}
      {!isEditing && activeTab === "teaching" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Active Class Assignments</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overview of your homeroom and subject teaching responsibilities.
              </p>
            </div>
            <Link
              href={ROUTES.TEACHER.CLASSES}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <span>Manage Classes</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {sections.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-xs min-h-[200px] flex flex-col items-center justify-center">
              <School size={28} className="text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-foreground">No active class assignments</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                You have not been assigned to any sections for this academic period.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        Section {sec.name}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                        Grade {sec.gradeLevel} &bull; {sec.academicYearName}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground shrink-0">
                      {sec.homeroomTeacher?.teacherId === profile.id ? "Homeroom" : "Subject"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs text-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Students</span>
                      <p className="text-xs font-medium text-foreground">
                        {sec.studentCount} / {sec.capacity ?? "—"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Utilization</span>
                      <p className="text-xs font-medium text-foreground">
                        {formatCapacityUtilization(sec.studentCount, sec.capacity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
