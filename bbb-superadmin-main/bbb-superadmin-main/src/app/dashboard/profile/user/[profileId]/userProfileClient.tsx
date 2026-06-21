"use client";

import {
  blockUserById,
  deleteBrideOrGroomById,
  resetUserPassword,
} from "@/action/groom";
import ButtonLoading from "@/components/buttonLoading";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfileCopyStore } from "@/hooks/useProfileCopyStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateStrongPassword } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Ban,
  Check,
  Copy,
  Loader2,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

export default function UserProfileClient({
  userId,
  blockStatus,
}: {
  userId: string;
  blockStatus: boolean;
}) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetPasswordFormView, setResetPasswordFormView] = useState(false);

  const newPassword = generateStrongPassword();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await deleteBrideOrGroomById(userId);
      if (response?.success) {
        toast.success(response.message || "User deleted successfully.");
        router.back();
      } else {
        toast.error(
          response?.message || "Failed to delete team. Please try again."
        );
      }
      router.refresh();
    } catch {
      toast.error("Failed to delete team. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBlock = async () => {
    setBlocking(true);
    try {
      const response = await blockUserById(userId, !blockStatus);
      if (response?.success) {
        toast.success(response.message || "User blocked successfully.");
      } else {
        toast.error(
          response?.message || "Failed to block user. Please try again."
        );
      }
      router.refresh();
    } catch {
      toast.error("Failed to block user. Please try again.");
    } finally {
      setBlocking(false);
    }
  };

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: newPassword,
    },
  });

  async function onSubmitResetPassword(
    values: z.infer<typeof resetPasswordSchema>
  ) {
    setResetting(true);
    try {
      const response = await resetUserPassword(userId, values?.password);
      if (response?.success) {
        resetPasswordForm.reset();
        toast.success(response.message || "Password reset successfully.");
        setResetPasswordFormView(false);
      } else {
        toast.error(
          response?.message || "Failed to reset password. Please try again."
        );
      }
      router.refresh();
    } catch {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div
      className={
        "bg-card flex flex-1 flex-col space-y-3 rounded-2xl p-4 shadow-md ring-1 ring-red-400 md:p-6"
      }
    >
      <h1 className={"font-semibold text-red-500"}>Danger Zone</h1>
      <div className={"flex flex-col gap-5 md:flex-row md:gap-4"}>
        <Button
          variant={"outline"}
          size="sm"
          onClick={() => setResetPasswordFormView(!resetPasswordFormView)}
        >
          <RotateCcw />
          <span>Reset Password</span>
        </Button>
        <Button
          variant={"outline"}
          size="sm"
          onClick={handleBlock}
          disabled={blocking}
          className={
            !blockStatus
              ? "text-destructive hover:text-destructive border-destructive dark:border-destructive"
              : ""
          }
        >
          {blocking ? (
            <ButtonLoading text={blockStatus ? "Unblocking" : "Blocking"} />
          ) : blockStatus ? (
            <>
              <ShieldCheck />
              <span>Unblock</span>
            </>
          ) : (
            <>
              <Ban />
              <span>Logout & Block</span>
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"destructive"} size="sm" disabled={deleting}>
              {deleting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Trash2 />
                  <span>Delete Profile</span>
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                <AlertDialogTitle>
                  Permanently Delete This User?
                </AlertDialogTitle>
              </div>

              <AlertDialogDescription asChild>
                <div className="text-muted-foreground mt-3 space-y-4 text-sm">
                  <p>
                    This action will permanently remove the user&apos;s account
                    and all associated data from our servers.
                  </p>

                  <div className="bg-muted/40 rounded-md border p-3">
                    <p className="text-foreground mb-2 font-medium">
                      The following data will be deleted:
                    </p>

                    <ul className="list-disc space-y-1 pl-5">
                      <li>Account & profile information</li>
                      <li>All subscription & matching payments</li>
                      <li>All chat messages (Users, Team & Super Admin)</li>
                      <li>Friend requests</li>
                      <li>Reports (filed by and against this user)</li>
                      <li>Ghotok reviews</li>
                    </ul>
                  </div>

                  <p className="text-destructive font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel>No, Keep Account</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, Permanently Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {resetPasswordFormView && (
        <div className={"mt-3 flex max-w-sm rounded-2xl border shadow-md"}>
          <Form {...resetPasswordForm}>
            <form
              onSubmit={resetPasswordForm.handleSubmit(onSubmitResetPassword)}
              className="flex w-full flex-col gap-4 p-4"
            >
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      New Password <span className={"text-destructive"}>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex w-full gap-2">
                        <Input
                          type="text"
                          placeholder="Enter password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant={"outline"}
                          size={"icon"}
                          onClick={() =>
                            resetPasswordForm.setValue(
                              "password",
                              generateStrongPassword(),
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              }
                            )
                          }
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={resetting}>
                {resetting ? (
                  <ButtonLoading text="Resetting" />
                ) : (
                  <>
                    <RotateCcw />
                    <span>Reset Password</span>
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}

export function CopyableComponent({
  children,
  copyText,
}: {
  children: React.ReactNode;
  copyText: string;
}) {
  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="hover:bg-muted flex cursor-pointer items-center gap-1 rounded-md px-1 transition"
    >
      {children}
    </button>
  );
}

function Placeholder() {
  return <span className="text-muted-foreground italic">—</span>;
}

export function FieldRowWithCopy({
  label,
  value,
  copyText,
  copyKey,
}: {
  label: string;
  value: React.ReactNode;
  copyText: string;
  copyKey?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { isMarkingMode, selectedFields, toggleField } = useProfileCopyStore();
  const isChecked = copyKey ? selectedFields.includes(copyKey) : false;

  const isEmpty = (v: unknown) =>
    v === null || v === undefined || (typeof v === "string" && v.trim() === "");

  const handleCopy = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (isMarkingMode && copyKey) {
      toggleField(copyKey);
      return;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch {
      toast.error("Failed to copy");
    }
  };

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div
      onClick={handleCopy}
      className={`bg-card hover:bg-muted-foreground/10 relative flex cursor-pointer flex-col gap-1 rounded-xl border border-green-600 p-3 transition-all duration-200 active:scale-[0.98] ${copied ? "ring-1 ring-green-500/90" : ""} ${isMarkingMode && copyKey && isChecked ? "border-rose-500 ring-1 ring-rose-500/50" : ""} `}
    >
      {/* Icon */}
      {isMarkingMode && copyKey ? (
        <div className="absolute top-3 right-3 pointer-events-none">
          <Checkbox checked={isChecked} />
        </div>
      ) : (
        <span
          className={`absolute top-3 right-3 transition-all duration-300 ease-out ${copied ? "scale-110 opacity-100" : "scale-100 opacity-80"} `}
        >
          {copied ? (
            <Check className="animate-in zoom-in-50 fade-in h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-green-600" />
          )}
        </span>
      )}

      <span className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </span>

      <div className="text-sm">{isEmpty(value) ? <Placeholder /> : value}</div>
    </div>
  );
}
