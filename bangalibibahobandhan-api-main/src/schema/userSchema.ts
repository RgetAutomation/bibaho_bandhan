import { string, object, enum as ZodEnum, boolean, array, coerce } from "zod";

export const updateUserProfileSchema = object({
  isGhotokOwned: boolean().default(false),
  isProfilePublic: boolean().default(false),
  allowSocialPublish: boolean().default(false),

  dob: string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date must be a valid ISO datetime string",
  }),
  maritalStatus: ZodEnum(["NEVER MARRIED", "DIVORCED", "WIDOWED", "WIDOWER"], {
    required_error: "Marital status is required",
  }),
  children: coerce.number().optional(),
  speciallyAble: boolean().default(false),
  whatsappNumber: string()
    .trim()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "WhatsApp number must be exactly 10 digits",
    }),

  alternatePhone: string()
    .trim()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "Mobile number must be exactly 10 digits",
    }),
  religion: ZodEnum(
    [
      "HINDU",
      "CHRISTIAN",
      "MUSLIM",
      "SIKH",
      "BUDDHIST",
      "SARNAISM",
      "JAIN",
      "OTHER",
    ],
    {
      required_error: "Religion is required",
    }
  ),
  gotra: string().optional(),
  caste: ZodEnum(["GENERAL", "OBC", "SC", "ST", "OTHERS"], {
    required_error: "Caste is required",
  }),
  subCaste: string().optional(),
  manglik: boolean().default(false),
  height: string().optional(),
  weight: string().optional(),
  bloodGroup: string().optional(),
  skinTone: string().optional(),
  bodyType: string().optional(),
  eatingHabits: string().optional(),
  smokingHabits: string().optional(),
  drinkingHabits: string().optional(),
  addressLine1: string({
    required_error: "Address line 1 is required",
  }).min(3),
  addressLine2: string().optional(),
  postOffice: string({
    required_error: "Post office is required",
  }).min(3),
  policeStation: string({
    required_error: "Police station is required",
  }).min(3),
  dist: string({
    required_error: "District is required",
  }).min(3),
  state: string({
    required_error: "State is required",
  }).min(2),
  pinCode: string({
    required_error: "Pincode is required",
  })
    .min(6)
    .max(6),
  aboutMyself: string().optional(),
  profession: string({
    required_error: "Profession is required",
  }).min(3),
  education: string({
    required_error: "Education is required",
  }).min(3),
  hobbies: string().optional(),
  monthlyIncome: string().optional(),
  languages: string().optional(),
  familyMembers: string().optional(),
  fatherProfession: string().optional(),
  candidatePreferences: string().optional(),
  locationPreferences: string().optional(),
  aboutMyPartner: string().optional(),
});
