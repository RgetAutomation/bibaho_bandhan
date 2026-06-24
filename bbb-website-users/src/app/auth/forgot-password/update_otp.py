import re

filepath = r"c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\auth\forgot-password\forgotPasswordClientPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
if 'import React, { useState, useEffect } from "react";' not in content:
    content = content.replace('import React, { useState } from "react";', 'import React, { useState, useEffect } from "react";')

# 2. Add states and timer effect inside the component
states_to_add = """  const [otpTimer, setOtpTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);
"""
if "const [otpTimer" not in content:
    content = content.replace('const [otp, setOtp] = useState("");', 'const [otp, setOtp] = useState("");\n' + states_to_add)

# 3. Add handleResendOtp function
resend_function = """
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const inputType = detectIdentifierType(target);
      const bodyData = inputType === "EMAIL" ? { email: target } : { mobile: target };

      const res = await fetch(`${MAIN_API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const response = await res.json();
      if (res.ok) {
        toast.success("OTP resent successfully!");
        setOtpTimer(60);
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setResendLoading(false);
    }
  };
"""
if "const handleResendOtp" not in content:
    content = content.replace('const onStep2Submit = async', resend_function + '\n  const onStep2Submit = async')

# 4. Modify onStep1Submit to set timer
if "setStep(2);" in content and "setOtpTimer(60);" not in content:
    content = content.replace('setStep(2);', 'setStep(2);\n        setOtpTimer(60);')

# 5. Modify Step 2 UI
# I will replace the Step 2 form section.
step2_ui_old = """      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="w-full space-y-4">
            <FormField
              control={step2Form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                    6-Digit OTP
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 text-sm tracking-widest font-mono"
                        placeholder="• • • • • •"
                        type="text"
                        maxLength={6}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\\D/g, ""))}
                      />
                      <div className="text-[#E51E44] dark:text-rose-500 absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-disabled:opacity-50">
                        <KeyRound size={18} aria-hidden="true" strokeWidth={2} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-10 sm:h-11 rounded-xl">
                Back
              </Button>
              <Button type="submit" className="w-2/3 h-10 sm:h-11 rounded-xl bg-[#E51E44] hover:bg-[#C21A3A] dark:bg-rose-700 dark:hover:bg-rose-800 text-white text-sm font-semibold">
                Verify & Next
              </Button>
            </div>
          </form>
        </Form>
      )}"""

# First, fix the onChange in the regex if it was there or not. In original it was just `{...field}`
step2_ui_original = """      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="w-full space-y-4">
            <FormField
              control={step2Form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                    6-Digit OTP
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 text-sm tracking-widest font-mono"
                        placeholder="• • • • • •"
                        type="text"
                        maxLength={6}
                        {...field}
                      />
                      <div className="text-[#E51E44] dark:text-rose-500 absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-disabled:opacity-50">
                        <KeyRound size={18} aria-hidden="true" strokeWidth={2} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-10 sm:h-11 rounded-xl">
                Back
              </Button>
              <Button type="submit" className="w-2/3 h-10 sm:h-11 rounded-xl bg-[#E51E44] hover:bg-[#C21A3A] dark:bg-rose-700 dark:hover:bg-rose-800 text-white text-sm font-semibold">
                Verify & Next
              </Button>
            </div>
          </form>
        </Form>
      )}"""

step2_ui_new = """      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="w-full space-y-4">
            <FormField
              control={step2Form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                    6-Digit OTP
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <div className="relative flex-grow">
                        <Input
                          className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 text-sm tracking-widest font-mono text-center"
                          placeholder="• • • • • •"
                          type="text"
                          maxLength={6}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.replace(/\\D/g, ""))}
                        />
                        <div className="text-[#E51E44] dark:text-rose-500 absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-disabled:opacity-50">
                          <KeyRound size={18} aria-hidden="true" strokeWidth={2} />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOtp}
                        disabled={resendLoading || otpTimer > 0}
                        className="h-10 sm:h-11 rounded-xl px-4 text-xs font-bold border-zinc-200 dark:border-zinc-700 w-[100px]"
                      >
                        {resendLoading ? (
                          <LoadingButton title="..." />
                        ) : otpTimer > 0 ? (
                          `${otpTimer}s`
                        ) : (
                          "Resend"
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-10 sm:h-11 rounded-xl">
                Back
              </Button>
              <Button type="submit" className="w-2/3 h-10 sm:h-11 rounded-xl bg-[#E51E44] hover:bg-[#C21A3A] dark:bg-rose-700 dark:hover:bg-rose-800 text-white text-sm font-semibold">
                Verify & Next
              </Button>
            </div>
          </form>
        </Form>
      )}"""

content = content.replace(step2_ui_original, step2_ui_new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated OTP inputs successfully!")
