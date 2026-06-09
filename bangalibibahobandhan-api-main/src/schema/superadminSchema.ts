import { object, string } from "zod";

export const planSchema = object({
  title: string({ required_error: "Plan name is required" }).min(3, {
    message: "Plan name at least 3 characters long",
  }),
  price: string({ required_error: "Price is required" }).min(1, {
    message: "Price at least 1 characters long",
  }),
  duration: string({ required_error: "Duration is required" }).min(3, {
    message: "Duration at least 1 characters long",
  }),
  connection: string({ required_error: "Connection is required" }).min(1, {
    message: "Connection at least 1 characters long",
  }),
});
