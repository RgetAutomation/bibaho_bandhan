"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, User, Shield } from "lucide-react";
import z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ButtonLoading from "@/components/buttonLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const changeMobileSchema = z.object({
  mobile: z.string().min(10).max(10),
});

// const changeEmailSchema = z.object({
//   email: z.email(),
// });

export default function ProfileClient({
  user,
}: {
  user: {
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    internalId: number;
    lastName: string;
    gender: string;
    phone: string;
    role: string;
    middleName?: string | null | undefined;
    username?: string | null | undefined;
    displayUsername?: string | null | undefined;
  };
}) {
  const [changingMobile, setChangingMobile] = useState(false);
  //const [changingEmail, setChangingEmail] = useState(false);

  const router = useRouter();

  const mobileForm = useForm({
    resolver: zodResolver(changeMobileSchema),
    defaultValues: {
      mobile: user.phone,
    },
  });

  // const emailForm = useForm({
  //   resolver: zodResolver(changeEmailSchema),
  //   defaultValues: {
  //     email: user.email,
  //   },
  // });

  const handleMobileChange = async (
    value: z.infer<typeof changeMobileSchema>
  ) => {
    setChangingMobile(true);
    const { data: response } = await authClient.isUsernameAvailable({
      username: value.mobile,
    });
    if (response?.available) {
      const { data, error } = await authClient.updateUser({
        username: value.mobile,
      });
      if (data?.status && !error) {
        toast.success("Mobile number changed successfully");
        router.refresh();
      } else {
        toast.error(error?.message || "Failed to change mobile number");
      }
    } else {
      toast.error("Mobile number is already in use");
    }
    setChangingMobile(false);
  };

  // const handleEmailChange = async (
  //   value: z.infer<typeof changeEmailSchema>
  // ) => {
  //   setChangingEmail(true);
  //   const { data, error } = await authClient.changeEmail({
  //     newEmail: value.email,
  //   });

  //   if (data?.status && !error) {
  //     toast.success("Email changed successfully");
  //     router.refresh();
  //   } else {
  //     toast.error(error?.message || "Failed to change email");
  //   }
  //   setChangingEmail(false);
  // };

  return (
    <div className={"flex w-full flex-1 flex-col gap-4 p-3 md:p-5"}>
      <div className="border-border w-full max-w-2xl overflow-hidden rounded-2xl border shadow-md">
        <CardHeader className="bg-muted/30 flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">
                {user.name} {user.middleName && <span>{user.middleName}</span>}{" "}
                {user.lastName}
                {"  "}
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-1 text-xs font-medium tracking-wide uppercase"
                >
                  {user.role}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                @{user.displayUsername}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <Button
            className="rounded-full"
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/auth/login";
                  },
                },
              })
            }
          >
            Logout
          </Button>
        </CardHeader>

        <Separator />

        <CardContent className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="text-muted-foreground mt-0.5 size-4" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone className="text-muted-foreground mt-0.5 size-4" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-muted-foreground text-sm">{user.phone}</p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-3">
            <User className="text-muted-foreground mt-0.5 size-4" />
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-muted-foreground text-sm">
                {user.gender?.charAt(0) + user.gender?.slice(1).toLowerCase()}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3">
            <Shield className="text-muted-foreground mt-0.5 size-4" />
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-muted-foreground text-sm">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="border-border w-full max-w-2xl overflow-hidden rounded-2xl border p-4 shadow-md lg:p-5">
        <div className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h1 className="text-semibold text-lg">Change Mobile</h1>
            <p className="text-muted-foreground text-sm">
              Change your mobile number
            </p>
          </div>

          <Form {...mobileForm}>
            <form
              onSubmit={mobileForm.handleSubmit(handleMobileChange)}
              className="flex flex-col space-y-5"
            >
              {/* Mobile */}
              <FormField
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Mobile Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex rounded-md shadow-xs">
                        <span className="border-input inline-flex items-center rounded-s-md border px-3 text-sm">
                          +91
                        </span>
                        <Input
                          className="rounded-s-none shadow-none"
                          placeholder="Enter your mobile number"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className={"flex items-center justify-end"}>
                <Button
                  className="rounded-full font-semibold"
                  type="submit"
                  disabled={changingMobile}
                >
                  {changingMobile ? (
                    <ButtonLoading text="Please wait" />
                  ) : (
                    "Change Mobile"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* <div className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h1 className="text-semibold text-lg">Change Email</h1>
            <p className="text-muted-foreground text-sm">
              Change your email address
            </p>
          </div>

          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailChange)}
              className="flex flex-col space-y-5"
            >
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className={"flex items-center justify-end"}>
                <Button
                  className="rounded-full font-semibold"
                  type="submit"
                  disabled={changingEmail}
                >
                  {changingEmail ? (
                    <ButtonLoading text="Please wait" />
                  ) : (
                    "Change Email"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div> */}
      </div>
    </div>
  );
}
