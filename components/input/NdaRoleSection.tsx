import { NDA_ROLES } from "@/components/input/analyzeContent";
import { OptionCardSection } from "@/components/input/OptionCardSection";

type NdaRole = "RECEIVING" | "DISCLOSING" | "MUTUAL";

interface NdaRoleSectionProps {
  value: NdaRole;
  onChange: (role: NdaRole) => void;
}

export function NdaRoleSection({ value, onChange }: NdaRoleSectionProps) {
  return (
    <OptionCardSection
      num="03"
      title="Clarify your role in the NDA"
      hint="The same clause can affect each side differently."
      options={NDA_ROLES}
      value={value}
      onChange={onChange}
    />
  );
}
