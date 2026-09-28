"use client";

import { useState } from "react";
import {
  User,
  GraduationCap,
  Users,
  MapPin,
  Edit,
  X,
} from "lucide-react";
import {
  FormField,
  DatePicker,
  LoadingSpinner,
  ErrorAlert,
  AddressHierarchyFields,
  AddressFormValues,
  ProfilePhotoUpload,
  SubmitButton,
} from "@/shared/components";
import {
  formatStudentAccountStatus,
  formatPhoneDisplay,
  formatDisplayDate,
  getErrorMessage,
} from "@/shared/utils";
import { fileToDataUrl } from "@/shared/utils/image.util";
import {
  useMyStudentProfile,
  useUpdateStudentProfile,
} from "../hooks/useStudentProfile";
import {
  ContactRelationship,
  UpdateStudentProfilePayload,
} from "../types/student-profile.types";

export function StudentProfileView() {
  const { data: profile, isLoading, error } = useMyStudentProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactRelationship, setContactRelationship] = useState<ContactRelationship>("FATHER");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAltPhone, setContactAltPhone] = useState("");
  const [addressValues, setAddressValues] = useState<AddressFormValues>({
    regionId: "",
    zoneId: "",
    woredaId: "",
    cityId: "",
    kebeleId: "",
    specificLocation: "",
  });

  const updateMutation = useUpdateStudentProfile();

  const handleOpenEdit = () => {
    if (!profile) return;
    setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] || "" : "");
    setNationality(profile.nationality || "Ethiopian");
    setPhotoUrl(profile.photoUrl || null);

    const primaryContact = profile.contacts?.find((c) => c.isPrimary) || profile.contacts?.[0];
    setContactName(primaryContact?.fullName || "");
    setContactRelationship(primaryContact?.relationship || "FATHER");
    setContactPhone(primaryContact?.phoneNumber || "");
    setContactAltPhone(primaryContact?.alternativePhoneNumber || "");

    setAddressValues({
      regionId: profile.address?.regionName || profile.address?.regionId || "",
      zoneId: profile.address?.zoneName || profile.address?.zoneId || "",
      woredaId: profile.address?.woredaName || profile.address?.woredaId || "",
      cityId: profile.address?.cityName || profile.address?.cityId || "",
      kebeleId: profile.address?.kebeleName || profile.address?.kebeleId || "",
      specificLocation: profile.address?.specificLocation || "",
    });

    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const payload: UpdateStudentProfilePayload = {
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      nationality: nationality.trim() || undefined,
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
              isEmergencyContact: true,
            },
          ]
        : undefined,
    };

    await updateMutation.mutateAsync(payload, {
      onSuccess: () => {
        setIsEditModalOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <ErrorAlert
          message={getErrorMessage(error, "Failed to load student profile details.")}
        />
      </div>
    );
  }

  const primaryContact = profile.contacts?.find((c) => c.isPrimary) || profile.contacts?.[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
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
                  Student
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap font-mono">
                <span className="font-semibold text-foreground">
                  {profile.studentCode}
                </span>
                {profile.enrollment && (
                  <>
                    <span>•</span>
                    <span>
                      Grade {profile.enrollment.gradeLevel} — {profile.enrollment.sectionName}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="font-medium text-foreground">
                  {formatStudentAccountStatus(profile.accountStatus || profile.status)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <Edit size={14} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

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
                {profile.middleName}
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
                {profile.dateOfBirth ? formatDisplayDate(profile.dateOfBirth) : "Not registered"}
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

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Assigned Username
              </span>
              <span className="text-sm font-mono font-medium text-foreground mt-1 block">
                {profile.username || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <GraduationCap size={16} className="text-muted-foreground" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              Academic Enrollment
            </h2>
          </div>

          {profile.enrollment ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Academic Year
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.enrollment.academicYearName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Grade Level
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  Grade {profile.enrollment.gradeLevel}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Section
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile.enrollment.sectionName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Enrollment Status
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block capitalize">
                  {profile.enrollment.status.toLowerCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-border bg-background/50 text-xs text-muted-foreground">
              No active enrollment record found.
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Users size={16} className="text-muted-foreground" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              Parent Contact
            </h2>
          </div>

          {primaryContact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Parent Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {primaryContact.fullName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Relationship
                </span>
                <span className="text-sm font-medium capitalize text-foreground mt-1 block">
                  {primaryContact.relationship.toLowerCase()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Primary Phone
                </span>
                <span className="text-sm font-mono font-medium text-foreground mt-1 block">
                  {formatPhoneDisplay(primaryContact.phoneNumber) || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Alternative Phone
                </span>
                <span className="text-sm font-mono font-medium text-foreground mt-1 block">
                  {formatPhoneDisplay(primaryContact.alternativePhoneNumber || "") || "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-border bg-background/50 text-xs text-muted-foreground">
              No parent contact registered yet. Click &quot;Edit Profile&quot; to add.
            </div>
          )}
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
            <div className="p-3.5 rounded-xl border border-border bg-background/50 text-xs text-muted-foreground">
              No residential address registered. Click &quot;Edit Profile&quot; to add your address details.
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Edit Student Profile
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your personal details, photo, parent contact, and residential location
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
              {updateMutation.error && (
                <ErrorAlert
                  message={getErrorMessage(
                    updateMutation.error,
                    "Failed to update profile. Please check your entries and try again."
                  )}
                />
              )}

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-border">
                <DatePicker
                  id="editDob"
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                />

                <FormField
                  id="editNationality"
                  label="Nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. Ethiopian"
                />
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Parent Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    id="editContactName"
                    label="Parent Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Kebede Tessema"
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor="editRelationship"
                      className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block"
                    >
                      Relationship
                    </label>
                    <select
                      id="editRelationship"
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
                    id="editContactPhone"
                    label="Primary Phone Number"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 0911223344"
                  />

                  <FormField
                    id="editContactAltPhone"
                    label="Alternative Phone (Optional)"
                    type="tel"
                    value={contactAltPhone}
                    onChange={(e) => setContactAltPhone(e.target.value)}
                    placeholder="e.g. 0922334455"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Residential Location
                </h3>
                <AddressHierarchyFields
                  values={addressValues}
                  onChange={(field, val) =>
                    setAddressValues((prev) => ({ ...prev, [field]: val }))
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <SubmitButton
                  type="submit"
                  isLoading={updateMutation.isPending}
                  loadingText="Saving..."
                  className="w-auto h-9 px-4 text-xs font-semibold"
                >
                  Save Changes
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
