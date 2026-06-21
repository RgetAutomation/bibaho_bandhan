"use client";

import { useState, useEffect } from "react";
import { getSystemSettings, saveSystemSettings } from "@/action/settings";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Mail, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    smsGatewayUrl: "",
    smsApiKey: "",
  });

  useEffect(() => {
    async function loadSettings() {
      const data = await getSystemSettings();
      if (data) {
        setFormData({
          smtpHost: data.smtpHost || "",
          smtpPort: data.smtpPort ? data.smtpPort.toString() : "",
          smtpUser: data.smtpUser || "",
          smtpPass: data.smtpPass || "",
          smsGatewayUrl: data.smsGatewayUrl || "",
          smsApiKey: data.smsApiKey || "",
        });
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveSystemSettings(formData);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-[#E51E44]/10 rounded-full">
          <Settings className="w-8 h-8 text-[#E51E44]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-sm text-gray-500">Manage your OTP gateways and email configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-t-4 border-t-[#E51E44] shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-[#E51E44]" />
              <CardTitle className="text-xl">Email (SMTP) Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure the SMTP server used for sending Email OTPs to users during registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                name="smtpHost"
                value={formData.smtpHost}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                className="focus-visible:ring-[#E51E44]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                name="smtpPort"
                value={formData.smtpPort}
                onChange={handleChange}
                placeholder="587"
                className="focus-visible:ring-[#E51E44]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Username (Email)</Label>
              <Input
                id="smtpUser"
                name="smtpUser"
                value={formData.smtpUser}
                onChange={handleChange}
                placeholder="your-email@example.com"
                className="focus-visible:ring-[#E51E44]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPass">SMTP App Password</Label>
              <Input
                id="smtpPass"
                type="password"
                name="smtpPass"
                value={formData.smtpPass}
                onChange={handleChange}
                placeholder="••••••••"
                className="focus-visible:ring-[#E51E44]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#E51E44] shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-[#E51E44]" />
              <CardTitle className="text-xl">SMS Gateway Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure the third-party SMS provider for sending mobile OTPs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smsGatewayUrl">SMS Gateway URL</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Use the placeholders <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[#E51E44]">{"{{mobile}}"}</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[#E51E44]">{"{{otp}}"}</code>, and <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[#E51E44]">{"{{apikey}}"}</code>.
              </p>
              <Input
                id="smsGatewayUrl"
                name="smsGatewayUrl"
                value={formData.smsGatewayUrl}
                onChange={handleChange}
                placeholder="https://api.smsgateway.com/send?apikey={{apikey}}&to={{mobile}}&msg=Your+OTP+is+{{otp}}"
                className="focus-visible:ring-[#E51E44]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smsApiKey">SMS API Key (Optional)</Label>
              <Input
                id="smsApiKey"
                name="smsApiKey"
                value={formData.smsApiKey}
                onChange={handleChange}
                placeholder="Your SMS Gateway API Key"
                className="focus-visible:ring-[#E51E44]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#E51E44] hover:bg-[#c41537] text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-lg font-medium w-full md:w-auto"
          >
            {loading ? "Saving Settings..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}
