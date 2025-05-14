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
import {
  linkedinConnect,
  twitterConnect,
  wordpressConnect,
} from "@/components/Service";

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
  >({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const [mergedData, setMergedData] = useState<
    (PlatformConnection & { platform: string })[]
  >([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [wordpressConnected, setWordpressConnected] = useState(false);

  const [linkedinSuccessMessage, setLinkedinSuccessMessage] = useState<
    string | null
  >(null);
  const [twitterSuccessMessage, setTwitterSuccessMessage] = useState<
    string | null
  >(null);
  const [wordpressSuccessMessage, setWordpressSuccessMessage] = useState<
    string | null
  >(null);

  const [wordpressConnecting, setWordpressConnecting] = useState(false);

  useEffect(() => {
    const initialConnections = Object.fromEntries(
      mergedData.map((item) => [item.platform, item])
    );
    setConnections(initialConnections);
  }, [mergedData]);

  const handleLinkedInConnect = async () => {
    setLoading(true);
    try {
      const result = await linkedinConnect();
      if (result && result.success) {
        setLinkedinConnected(true);
        setLinkedinSuccessMessage("LinkedIn connected successfully!");
        localStorage.setItem("linkedin_connected", "true");
        setTimeout(() => setLinkedinSuccessMessage(null), 5000);
      } else {
        setLinkedinSuccessMessage("LinkedIn connection failed.");
      }
    } catch (e) {
      console.error("LinkedIn connection failed:", e);
      setLinkedinSuccessMessage("Error connecting to LinkedIn.");
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterConnect = async () => {
    setLoading(true);
    try {
      const result = await twitterConnect();
      if (result && result.success) {
        setTwitterConnected(true);
        setTwitterSuccessMessage("Twitter connected successfully!");
        localStorage.setItem("twitter_connected", "true");
        setTimeout(() => setTwitterSuccessMessage(null), 5000);
      } else {
        setTwitterSuccessMessage("Twitter connection failed.");
      }
    } catch (e) {
      console.error("Twitter connection failed:", e);
      setTwitterSuccessMessage("Error connecting to Twitter.");
    } finally {
      setLoading(false);
    }
  };

  const handleWordpressConnect = async () => {
    setLoading(true);
    try {
      const result = await wordpressConnect(siteUrl, username, password);
      if (result && result.message === "WordPress connected successfully") {
        setWordpressConnected(true);
        setWordpressSuccessMessage(result.message);
        localStorage.setItem("wordpress_connected", "true");
        setWordpressConnecting(false);
      } else {
        setWordpressSuccessMessage("Connection failed. Try again.");
      }
    } catch (error) {
      console.error("WordPress connection failed:", error);
      setWordpressSuccessMessage("Error connecting to WordPress.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInDisconnect = () => {
    setLinkedinConnected(false);
    setLinkedinSuccessMessage(null);
    localStorage.removeItem("linkedin_connected");
  };

  const handleTwitterDisconnect = () => {
    setTwitterConnected(false);
    setTwitterSuccessMessage(null);
    localStorage.removeItem("twitter_connected");
  };

  const handleWordpressDisconnect = () => {
    setWordpressConnected(false);
    setWordpressSuccessMessage(null);
    localStorage.removeItem("wordpress_connected");
    setSiteUrl("");
    setUsername("");
    setPassword("");
  };

  useEffect(() => {
    // Check initial connection status from localStorage only
    const linkedinStored = localStorage.getItem("linkedin_connected");
    const twitterStored = localStorage.getItem("twitter_connected");
    const wordpressStored = localStorage.getItem("wordpress_connected");

    if (linkedinStored === "true") setLinkedinConnected(true);
    if (twitterStored === "true") setTwitterConnected(true);
    if (wordpressStored === "true") setWordpressConnected(true);
  }, []);

  useEffect(() => {
    // Handle URL parameters for connection callbacks
    const params = new URLSearchParams(window.location.search);

    const handleConnectionCallback = (
      key: string,
      setState: (val: boolean) => void,
      setSuccessMessage: (msg: string | null) => void
    ) => {
      if (params.get(`${key}_connected`) === "true") {
        localStorage.setItem(`${key}_connected`, "true");
        setState(true);
        setSuccessMessage(
          `${
            key.charAt(0).toUpperCase() + key.slice(1)
          } connected successfully!`
        );
        setTimeout(() => setSuccessMessage(null), 5000);

        params.delete(`${key}_connected`);
        window.history.replaceState({}, "", `${window.location.pathname}`);
      }
    };

    handleConnectionCallback(
      "linkedin",
      setLinkedinConnected,
      setLinkedinSuccessMessage
    );
    handleConnectionCallback(
      "twitter",
      setTwitterConnected,
      setTwitterSuccessMessage
    );
    handleConnectionCallback(
      "wordpress",
      setWordpressConnected,
      setWordpressSuccessMessage
    );
  }, []);

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
                  connections[platform]?.[key as keyof PlatformConnection] || ""
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
            <h2 className="text-2xl font-semibold mb-4">
              Connect to Social Media Platform
            </h2>

            <div className="flex flex-wrap gap-6">
              <Card className="flex-1 pt-6">
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                    onClick={
                      linkedinConnected
                        ? handleLinkedInDisconnect
                        : handleLinkedInConnect
                    }
                    disabled={loading}
                  >
                    {linkedinConnected
                      ? "Disconnect LinkedIn"
                      : "Connect to LinkedIn"}
                  </Button>
                  {linkedinSuccessMessage && (
                    <div className="text-green-600">
                      {linkedinSuccessMessage}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="flex-1 pt-6">
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                    onClick={
                      twitterConnected
                        ? handleTwitterDisconnect
                        : handleTwitterConnect
                    }
                    disabled={loading}
                  >
                    {twitterConnected
                      ? "Disconnect Twitter"
                      : "Connect to Twitter"}
                  </Button>
                  {twitterSuccessMessage && (
                    <div className="text-green-600">
                      {twitterSuccessMessage}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="flex-1 pt-6">
                <CardContent className="space-y-4">
                  {!wordpressConnected && !wordpressConnecting && (
                    <Button
                      className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                      onClick={() => setWordpressConnecting(true)}
                    >
                      Connect to WordPress
                    </Button>
                  )}

                  {wordpressConnecting && !wordpressConnected && (
                    <>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="border rounded p-2 w-full"
                          placeholder="WordPress Site URL"
                          value={siteUrl}
                          onChange={(e) => setSiteUrl(e.target.value)}
                        />
                        <input
                          type="text"
                          className="border rounded p-2 w-full"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                          type="password"
                          className="border rounded p-2 w-full"
                          placeholder="App Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90 mt-4"
                        onClick={handleWordpressConnect}
                        disabled={loading}
                      >
                        {loading
                          ? "Connecting... to WordPress"
                          : "Connect to WordPress"}
                      </Button>
                    </>
                  )}

                  {wordpressConnected && (
                    <>
                      <Button
                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90"
                        onClick={handleWordpressDisconnect}
                      >
                        Disconnect WordPress
                      </Button>
                      {wordpressSuccessMessage && (
                        <div className="text-green-600 mt-2">
                          {wordpressSuccessMessage}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Model Credentials</h2>
            <Separator className="my-4" />
            <div className="grid gap-6 md:grid-cols-2">
              {MODEL_PLATFORMS.map(renderPlatformCard)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
