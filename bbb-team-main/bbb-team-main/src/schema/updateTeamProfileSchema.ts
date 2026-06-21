import { subYears } from "date-fns";
import { any, date, object, string } from "zod";

export const updateTeamProfileSchema = object({
  dob: date({ message: "Date of birth is required" })
    .refine(
      (date) => date <= new Date(subYears(new Date(), 18)),
      "You must be at least 18 years old"
    )
    .refine((date) => date >= new Date("1900-01-01"), "Date too early"),
  addressLine1: string().min(3, {
    message: "Address line 1 is required",
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
  pinCode: string()
    .min(6, {
      message: "Pin code is required",
    })
    .max(6, {
      message: "Pin code must be 6 digits",
    }),
  identification: any()
    .refine((files) => files?.length === 1, "ID Proof is required")
    .refine(
      (files) => files?.[0]?.size <= 20 * 1020 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(
          files?.[0]?.type
        ),
      "Only PNG, JPEG, or JPG files are allowed"
    ),
});
