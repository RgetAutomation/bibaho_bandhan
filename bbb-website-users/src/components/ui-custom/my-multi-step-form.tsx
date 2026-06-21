"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, object } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import RadioCustom from "./radio-custom";
import {
  accountSchema,
  passwordSchema,
  RegisterFormData,
  personalInfoSchemaForMSF,
} from "@/schema/authUserSchema";
import { Mars, Venus } from "lucide-react";
import InputCustom from "./input/input-custom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import InputPassword from "./input/password-input";
import InputEmail from "./input/input-email";
import InputPhone from "./input/input-phone";

// Combined schema
const formSchema = object({
  ...personalInfoSchemaForMSF.shape,
  ...accountSchema.shape,
  ...passwordSchema.shape,
});

type FormData = z.infer<typeof formSchema>;

interface MultiStepFormProps {
  className?: string;
  onSubmit?: (data: RegisterFormData) => void;
}

export default function MyMultiStepForm({
  className,
  onSubmit,
}: MultiStepFormProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      //gender: "MALE",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
    mode: "all", // Use "all" instead of "onChange" for more reliable validation
    reValidateMode: "onChange", // Still get onChange validation but more consistent
  });

  const steps = [
    {
      step: 1,
      id: "personal",
      title: "Personal Details",
      description: "Tell us about yourself",
      titleVisible: false,
      fields: ["firstName", "middleName", "lastName", "gender"],
    },
    {
      step: 2,
      id: "contact",
      title: "Contact Details",
      description: "Provide your contact details",
      titleVisible: true,
      fields: ["email", "mobile"],
    },
    {
      step: 3,
      id: "account",
      title: "Account Setup",
      description: "Create your account",
      titleVisible: true,
      fields: ["password", "confirmPassword"],
    },
  ];

  const genderOptions = [
    {
      value: "MALE",
      label: "Male",
      icon: Mars,
      textColor: "text-blue-400",
    },
    {
      value: "FEMALE",
      label: "Female",
      icon: Venus,
      textColor: "text-pink-400",
    },
  ];

  const handleNext = async () => {
    // On final step, we need full form validation including refine()
    if (step === steps.length - 1) {
      // Method 1: The most reliable way to trigger refine validation
      const isValid = await form.trigger(undefined, { shouldFocus: true });

      // Manual password check as backup
      const password = form.getValues("password");
      const confirmPassword = form.getValues("confirmPassword");
      if (password !== confirmPassword) {
        form.setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        return;
      }

      if (!isValid) return;
    }
    // For non-final steps, validate just current step fields
    else {
      const fieldsToValidate = steps[step].fields.map(
        (f) => f
      ) as (keyof FormData)[];
      const isValid = await form.trigger(fieldsToValidate, {
        shouldFocus: true,
      });
      if (!isValid) return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      form.handleSubmit(
        (data) => {
          setIsComplete(true);
          setIsSubmitting(false);
          onSubmit?.(data as any); // validated with .refine
        },
        (errors) => {
          console.error("Form validation errors:", errors);
          setIsSubmitting(false);
        }
      )();
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      {!isComplete ? (
        <Form {...form}>
          {/* Step indicators */}
          {/* <div className="mb-8 flex justify-between">
            <Stepper value={step} onValueChange={setStep}>
              {steps.map((stepItem) => (
                <StepperItem
                  key={stepItem.id}
                  step={stepItem.step}
                  className="not-last:flex-1"
                >
                  <div className="flex flex-col items-center justify-center gap-3 rounded">
                    <StepperIndicator />
                    <StepperTitle
                      className={cn(stepItem.step === step && "text-primary")}
                    >
                      {stepItem.title}
                    </StepperTitle>
                  </div>
                  {step < steps.length && (
                    <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </div> */}

          {/* Step Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                {/* <h2 className="text-xl font-bold">{steps[step].title}</h2>
                <p className="text-muted-foreground text-sm">
                  {steps[step].description}
                </p> */}
                <>
                  <h2 className="text-xl font-bold">{steps[step].title}</h2>
                  <p className="text-muted-foreground text-sm">
                    {steps[step].description}
                  </p>
                </>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {step === 0 && (
                  <>
                    <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-2">
                      <FormField
                        name="firstName"
                        render={({ field, fieldState }) => (
                          <FormItem className="w-full">
                            <Label htmlFor={field.name} className="mb-2">
                              First Name
                            </Label>
                            <FormControl>
                              <InputCustom
                                field={field}
                                ariaInvalid={fieldState.invalid}
                                placeholder="Enter your first name"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="middleName"
                        render={({ field, fieldState }) => (
                          <FormItem className="w-full">
                            <Label htmlFor={field.name} className="mb-2">
                              Middle Name
                            </Label>
                            <FormControl>
                              <InputCustom
                                field={field}
                                ariaInvalid={fieldState.invalid}
                                placeholder="Enter your middle name"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      name="lastName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor={field.name} className="mb-2">
                            Last Name
                          </Label>
                          <FormControl>
                            <InputCustom
                              field={field}
                              ariaInvalid={fieldState.invalid}
                              placeholder="Enter your last name"
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name={"gender"}
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor={field.name} className="mb-2">
                            Gender
                          </Label>
                          <FormControl>
                            <RadioCustom
                              field={field} // this gives onChange, value, etc.
                              items={genderOptions} // these are your label/value/icon
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                    <FormField
                      name={"email"}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor={field.name} className="mb-2">
                            Email
                          </Label>
                          <FormControl>
                            <InputEmail
                              field={field}
                              placeholder={"Enter your email"}
                              areaInvalid={fieldState.invalid}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={"mobile"}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor={field.name} className="mb-2">
                            Mobile Number
                          </Label>
                          <FormControl>
                            <InputPhone
                              field={field}
                              placeholder={"Enter your mobile number"}
                              type={"tel"}
                              areaInvalid={fieldState.invalid}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField
                      name={"password"}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor={field.name} className="mb-2">
                            Password
                          </Label>
                          <FormControl>
                            <InputPassword
                              field={field}
                              placeholder={"Enter your password"}
                              ariaInvalid={fieldState.invalid}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name={"confirmPassword"}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor={field.name} className="mb-2">
                            Confirm Password
                          </Label>
                          <FormControl>
                            <InputPassword
                              field={field}
                              placeholder={"Enter your confirm password"}
                              ariaInvalid={fieldState.invalid}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div
                  className={cn(
                    "flex pt-4 ",
                    step > 0 ? "justify-between" : "justify-end"
                  )}
                >
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={step === 0}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </div>
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    {step === steps.length ? (
                      isSubmitting ? (
                        "Submitting..."
                      ) : (
                        "Submit"
                      )
                    ) : (
                      <>
                        <span className="text-center">Next </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </Form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="py-10 text-center"
        >
          <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle2 className="text-primary h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Form Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the form. We&apos;ll be in touch soon.
          </p>
          <Button
            onClick={() => {
              setStep(0);
              form.reset();
              setIsComplete(false);
            }}
          >
            Start Over
          </Button>
        </motion.div>
      )}
    </div>
  );
}
