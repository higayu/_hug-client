import PersonalRecordPrompt from "./PersonalRecordPrompt";
import ProfessionalPrompt1 from "./ProfessionalPrompt1";
import ProfessionalPrompt2 from "./ProfessionalPrompt2";

export const AI_PROMPT_COMPONENT_MAP = {
  personal: {
    label: "個人",
    component: PersonalRecordPrompt,
  },
  professional1: {
    label: "専門的支援1",
    component: ProfessionalPrompt1,
  },
  professional2: {
    label: "専門的支援2",
    component: ProfessionalPrompt2,
  },
};
