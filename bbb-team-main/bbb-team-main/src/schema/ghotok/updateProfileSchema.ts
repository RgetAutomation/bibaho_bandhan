import z, { boolean, coerce, object, string } from "zod";

export const updateProfileSchema = object({
  isGhotokOwned: boolean().default(false),
  isProfilePublic: boolean().default(false),
  allowSocialPublish: boolean().default(false),
  // profileImages: string({ message: "Image URL is required" })
  //   .optional()
  //   .default(""),
  profileImages: string().optional(),

  dob: string({
    message: "Date of birth is required",
  }).min(10, {
    message: "Date must be a full ISO datetime string",
  }),
  maritalStatus: string().min(3, {
    message: "Marital status is required",
  }),
  children: coerce.number().optional().default(0),
  speciallyAble: boolean().default(false),
  religion: string().min(3, {
    message: "Religion is required",
  }),
  gotra: string().optional(),
  caste: string().min(2, {
    message: "Caste is required",
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
  addressLine1: string().min(3, {
    message: "Street address is required",
  }),
  addressLine2: string().optional(),
  postOffice: string().min(3, {
    message: "Post office is required",
  }),
  policeStation: string().min(3, {
    message: "Police station is required",
  }),
  dist: string().min(3, {
    message: "District is required",
  }),
  state: string().min(2, {
    message: "State is required",
  }),
  pinCode: string({
    message: "Pincode is required",
  })
    .min(6, {
      message: "Pincode at least 6 characters long",
    })
    .max(6, {
      message: "Pincode at most 6 characters long",
    }),
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
  aboutMyself: string().optional(),
  profession: string().min(3, {
    message: "Profession is required",
  }),
  education: string().min(3, {
    message: "Education is required",
  }),
  hobbies: string().optional(),
  monthlyIncome: string().optional(),
  languages: string().optional(),
  familyMembers: string().optional(),
  fatherProfession: string().optional(),
  candidatePreferences: string().optional(),
  locationPreferences: string().optional(),
  aboutMyPartner: string().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const profilePersonalSchema = updateProfileSchema.pick({
  dob: true,
  maritalStatus: true,
  children: true,
  speciallyAble: true,
  religion: true,
  gotra: true,
  caste: true,
  subCaste: true,
  manglik: true,
  height: true,
  weight: true,
  bloodGroup: true,
  skinTone: true,
  bodyType: true,
  eatingHabits: true,
  smokingHabits: true,
  drinkingHabits: true,
});

export const profileContactSchema = updateProfileSchema.pick({
  addressLine1: true,
  addressLine2: true,
  postOffice: true,
  policeStation: true,
  dist: true,
  state: true,
  pinCode: true,
  whatsappNumber: true,
  alternatePhone: true,
});

export const profileOtherSchema = updateProfileSchema.pick({
  aboutMyself: true,
  profession: true,
  education: true,
  hobbies: true,
  monthlyIncome: true,
  languages: true,
  familyMembers: true,
  fatherProfession: true,
  candidatePreferences: true,
  locationPreferences: true,
  allowSocialPublish: true,
  isProfileLocked: true,
  aboutMyPartner: true,
});

export const profileImageSchema = updateProfileSchema.pick({
  avatar: true,
  profileImages: true,
});

export type ProfileImageSchema = z.infer<typeof profileImageSchema>;
