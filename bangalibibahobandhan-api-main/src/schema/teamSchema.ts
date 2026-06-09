import { object, string } from "zod";

export const loginTeamSchema = object({
  email: string({ required_error: "Email or phone is required" }).min(10, {
    message: "Email or phone at least 10 characters long",
  }),

  password: string({ required_error: "Password is required" }).min(8, {
    message: "Password at least 8 characters long",
  }),
});

export const updateTeamProfileSchema = object({
  dob: string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date must be a valid ISO datetime string",
  }),
  // identificationProof: string().min(5, {
  //   message: "Identification proof required",
  // }),
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
});
