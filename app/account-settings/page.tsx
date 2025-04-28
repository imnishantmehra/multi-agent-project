"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, RotateCw, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PlatformConnection {
  apiKey?: string;
  secretKey?: string;
  accessToken?: string;
  appSecret?: string;
  clientSecret?: string;
  applicationPassword?: string;
}

const MODEL_PLATFORMS = ["OpenAI", "Claude", "Midjourney", "Eleven Labs"];
const SOCIAL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "YouTube",
  "Twitter",
  "LinkedIn",
  "WordPress",
  "TikTok",
];
const ALL_PLATFORMS = [...MODEL_PLATFORMS, ...SOCIAL_PLATFORMS];

export default function AccountSettings() {
  const [connections, setConnections] = useState<
    Record<string, PlatformConnection>
  >(
    ALL_PLATFORMS.reduce(
      (acc, platform) => ({
        ...acc,
        [platform]: {},
      }),
      {}
    )
  );
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);
  const [savedPlatform, setSavedPlatform] = useState<string | null>(null);
  const [activePlatforms, setActivePlatforms] = useState<
    Record<string, boolean>
  >(
    ALL_PLATFORMS.reduce(
      (acc, platform) => ({
        ...acc,
        [platform]: false,
      }),
      {}
    )
  );

  const handleInputChange = (
    platform: string,
    field: keyof PlatformConnection,
    value: string
  ) => {
    setConnections((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleCheckboxChange = (platform: string, checked: boolean) => {
    setActivePlatforms((prev) => ({
      ...prev,
      [platform]: checked,
    }));
  };

  const handleSave = async (platform: string) => {
    if (!activePlatforms[platform]) return;
    setSavingPlatform(platform);
    console.log(`Saving connection for ${platform}:`, connections[platform]);
    // TODO: Implement actual save logic here
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating API call
    setSavingPlatform(null);
    setSavedPlatform(platform);
  };

  useEffect(() => {
    if (savedPlatform) {
      const timer = setTimeout(() => {
        setSavedPlatform(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [savedPlatform]);

  const renderPlatformCard = (platform: string) => {
    const fields = (() => {
      switch (platform) {
        case "OpenAI":
        case "Claude":
        case "Eleven Labs":
        case "YouTube":
          return [{ key: "apiKey", label: "API Key" }];
        case "Instagram":
        case "Facebook":
        case "TikTok":
          return [
            { key: "accessToken", label: "Access Token" },
            { key: "appSecret", label: "App Secret" },
          ];
        case "Twitter":
          return [
            { key: "apiKey", label: "API Key" },
            { key: "secretKey", label: "API Secret Key" },
          ];
        case "LinkedIn":
          return [
            { key: "accessToken", label: "Access Token" },
            { key: "clientSecret", label: "Client Secret" },
          ];
        case "WordPress":
          return [
            { key: "applicationPassword", label: "Application Password" },
          ];
        default:
          return [
            { key: "apiKey", label: "API Key" },
            { key: "secretKey", label: "Secret Key" },
          ];
      }
    })();

    return (
      <Card
        key={platform}
        className={`transition-all duration-300 ${
          activePlatforms[platform] ? "opacity-100" : "opacity-50"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            {platform} Connection
          </CardTitle>
          <Checkbox
            checked={activePlatforms[platform]}
            onCheckedChange={(checked) =>
              handleCheckboxChange(platform, checked as boolean)
            }
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <h3 className="text-[1.1rem] font-semibold">{label}</h3>
              <Input
                id={`${platform}-${key}`}
                type="password"
                value={
                  connections[platform][key as keyof PlatformConnection] || ""
                }
                onChange={(e) =>
                  handleInputChange(
                    platform,
                    key as keyof PlatformConnection,
                    e.target.value
                  )
                }
              />
            </div>
          ))}
          <div className="relative pt-10">
            <Button
              onClick={() => handleSave(platform)}
              disabled={
                savingPlatform === platform || !activePlatforms[platform]
              }
              className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90 disabled:opacity-50"
            >
              {savingPlatform === platform ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `Save ${platform} Connection`
              )}
            </Button>
            {savedPlatform === platform && (
              <div className="absolute left-0 right-0 top-0 flex items-center justify-center text-green-600 font-medium">
                <Check className="w-4 h-4 mr-1" />
                Settings Saved
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#7A99A8]">
      {/* <Header username="John Doe" /> */}
      <Header />
      <main className="container max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center text-white hover:text-gray-200"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-white">
            Account Settings
          </h1>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Model Credentials</h2>
            <Separator className="my-4" />
            <div className="grid gap-6 md:grid-cols-2">
              {MODEL_PLATFORMS.map(renderPlatformCard)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">
              Platform Credentials
            </h2>
            <Separator className="my-4" />
            <div className="grid gap-6 md:grid-cols-2">
              {SOCIAL_PLATFORMS.map(renderPlatformCard)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
