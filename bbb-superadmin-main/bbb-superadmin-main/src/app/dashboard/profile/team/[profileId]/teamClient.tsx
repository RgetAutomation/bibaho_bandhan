"use client";

import {
  blockTeamById,
  deleteTeamById,
  resetTeamPassword,
} from "@/action/teams";
import ButtonLoading from "@/components/buttonLoading";
import { Button } from "@/components/ui/button";
import {
  Ban,
  Loader2,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

export default function TeamClientComponent({
  userId,
  userName,
  blockStatus,
}: {
  userId: string;
  userName: string;
  blockStatus: boolean;
}) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetPasswordFormView, setResetPasswordFormView] = useState(false);

  const newPassword = generateStrongPassword();

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
      const response = await resetTeamPassword(userId, values?.password);
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

  const handleBlock = async () => {
    setBlocking(true);
    try {
      const response = await blockTeamById(userId, !blockStatus);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await deleteTeamById(userId);
      if (response?.success) {
        toast.success(response.message || "Team deleted successfully.");
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

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
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
              <span>Unblock {userName}</span>
            </>
          ) : (
            <>
              <Ban />
              <span>Block & Logout</span>
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
                  <span>Delete Account</span>
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Do you really want to delete your team user?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the account and remove your data
                from servers. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Yes, Delete
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
