import { object, string } from "zod";

export const plansSchema = object({
  title: string().min(2, "Plan name is required"),
  price: string().min(1, "Price is required"),
  duration: string().min(1, "Duration is required"),
  //connections: string().min(1, "Connections is required"),
});
