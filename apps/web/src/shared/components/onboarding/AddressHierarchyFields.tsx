import { FormField } from "../FormField";

export interface AddressFormValues {
  readonly specificLocation?: string | null;
  readonly regionId?: string | null;
  readonly zoneId?: string | null;
  readonly woredaId?: string | null;
  readonly kebeleId?: string | null;
  readonly cityId?: string | null;
  readonly subCityId?: string | null;
}

export interface AddressHierarchyFieldsProps {
  readonly values: AddressFormValues;
  readonly onChange: (field: keyof AddressFormValues, value: string) => void;
  readonly errors?: Partial<Record<keyof AddressFormValues, string>>;
  readonly disabled?: boolean;
}

export function AddressHierarchyFields({
  values,
  onChange,
  errors = {},
  disabled = false,
}: AddressHierarchyFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <FormField
          id="specificLocation"
          label="Street Address / Specific Location"
          placeholder="e.g., Bole Subcity, House No. 123"
          value={values.specificLocation || ""}
          onChange={(e) => onChange("specificLocation", e.target.value)}
          error={errors.specificLocation}
          disabled={disabled}
          containerClassName="sm:col-span-2"
        />

        <FormField
          id="city"
          label="City / Town"
          placeholder="e.g., Addis Ababa"
          value={values.cityId || ""}
          onChange={(e) => onChange("cityId", e.target.value)}
          error={errors.cityId}
          disabled={disabled}
        />

        <FormField
          id="subCity"
          label="Sub-City"
          placeholder="e.g., Bole"
          value={values.subCityId || ""}
          onChange={(e) => onChange("subCityId", e.target.value)}
          error={errors.subCityId}
          disabled={disabled}
        />

        <FormField
          id="region"
          label="Region"
          placeholder="e.g., Oromia, Amhara"
          value={values.regionId || ""}
          onChange={(e) => onChange("regionId", e.target.value)}
          error={errors.regionId}
          disabled={disabled}
        />

        <FormField
          id="zone"
          label="Zone"
          placeholder="e.g., East Shewa"
          value={values.zoneId || ""}
          onChange={(e) => onChange("zoneId", e.target.value)}
          error={errors.zoneId}
          disabled={disabled}
        />

        <FormField
          id="woreda"
          label="Woreda"
          placeholder="e.g., Adama Woreda"
          value={values.woredaId || ""}
          onChange={(e) => onChange("woredaId", e.target.value)}
          error={errors.woredaId}
          disabled={disabled}
        />

        <FormField
          id="kebele"
          label="Kebele / Ward"
          placeholder="e.g., Kebele 04"
          value={values.kebeleId || ""}
          onChange={(e) => onChange("kebeleId", e.target.value)}
          error={errors.kebeleId}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
