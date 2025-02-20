"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  RotateCw,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  plateformScriptAgent,
  plateformScriptTask,
} from "@/components/Service";

interface PlatformConnection {
  role?: string;
  goal?: string;
  backstory?: string;
  description?: string;
  expected_output?: string;
}

const PLATFORMS_SCRIPT_REGENERATOR = [
  "Instagram",
  "Facebook",
  "YouTube",
  "Twitter",
  "LinkedIn",
  "WordPress",
  "TikTok",
  "Script_Research",
  "QC",
  "Script_Rewriter",
  "Regenrate_Content",
  "Regenrate_Subcontent",
];

const saveToLocalStorageWithExpiry = (key: string, data: any) => {
  const timestampedData = {
    data,
    timestamp: new Date().getTime(),
  };
  localStorage.setItem(key, JSON.stringify(timestampedData));
};

const loadFromLocalStorageWithExpiry = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp } = JSON.parse(item);
    const now = new Date().getTime();

    if (now - timestamp > 86400000) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error loading or parsing data from localStorage:", error);
    return null;
  }
};

export default function AccountSettings() {
  const [connections, setConnections] = useState<
    Record<string, PlatformConnection>
  >({});
  const [task, setTask] = useState<Record<string, PlatformConnection>>({});
  const [mergedData, setMergedData] = useState<
    (PlatformConnection & { platform: string })[]
  >([]);
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);
  const [savedPlatform, setSavedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgentScripts = useCallback(async () => {
    try {
      setLoading(true);

      const cachedAgentData = loadFromLocalStorageWithExpiry("agentData");
      const cachedTaskData = loadFromLocalStorageWithExpiry("taskData");

      if (cachedAgentData && cachedTaskData) {
        const merged = PLATFORMS_SCRIPT_REGENERATOR.map((platform) => ({
          platform,
          ...cachedAgentData[platform],
          ...cachedTaskData[platform],
        }));
        setMergedData(merged);
        setLoading(false);
        return;
      }

      const [agentResponses, taskResponses] = await Promise.all([
        Promise.all(
          PLATFORMS_SCRIPT_REGENERATOR.map((platform) =>
            plateformScriptAgent(platform.toLowerCase()).catch((err) => {
              console.error(`Error fetching agent data for ${platform}:`, err);
              return { role: "", goal: "", backstory: "" };
            })
          )
        ),
        Promise.all(
          PLATFORMS_SCRIPT_REGENERATOR.map((platform) =>
            plateformScriptTask(platform.toLowerCase()).catch((err) => {
              console.error(`Error fetching task data for ${platform}:`, err);
              return { description: "", expected_output: "" };
            })
          )
        ),
      ]);

      const agentData: Record<string, PlatformConnection> = {};
      const taskData: Record<string, PlatformConnection> = {};

      PLATFORMS_SCRIPT_REGENERATOR.forEach((platform, index) => {
        agentData[platform] = agentResponses[index];
        taskData[platform] = taskResponses[index];
      });

      saveToLocalStorageWithExpiry("agentData", agentData);
      saveToLocalStorageWithExpiry("taskData", taskData);

      const merged = PLATFORMS_SCRIPT_REGENERATOR.map((platform) => ({
        platform,
        ...agentData[platform],
        ...taskData[platform],
      }));

      setMergedData(merged);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching agent scripts:", err);
      setError("An error occurred while fetching data.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgentScripts();
  }, [fetchAgentScripts]);

  useEffect(() => {
    if (savedPlatform) {
      const timer = setTimeout(() => setSavedPlatform(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [savedPlatform]);

  const handleSave = async (platform: string) => {
    if (!mergedData.find((item) => item.platform === platform)) return;

    setSavingPlatform(platform);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSavingPlatform(null);
    setSavedPlatform(platform);
  };

  const renderPlatformCard = (platform: string) => {
    const fields = [
      "role",
      "goal",
      "backstory",
      "description",
      "expected_output",
    ];

    const platformData = mergedData.find((item) => item.platform === platform);

    return (
      <Card key={platform}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            <strong>{platform}</strong> Agent Script
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center text-red-500">
              <AlertCircle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : (
            fields.map((key) => (
              <div key={key} className="space-y-2">
                <h3 className="text-[1.1rem] font-semibold">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </h3>
                <textarea
                  id={`${platform}-${key}`}
                  value={platformData?.[key as keyof PlatformConnection] || ""}
                  onChange={(e) =>
                    setMergedData((prev) =>
                      prev.map((item) =>
                        item.platform === platform
                          ? { ...item, [key]: e.target.value }
                          : item
                      )
                    )
                  }
                  className="border rounded-md p-2 w-full focus:ring-1 focus:ring-[#020817] focus:border-transparent text-sm min-h-[100px]"
                  rows={3}
                />
              </div>
            ))
          )}
          {!loading && !error && (
            <div className="relative pt-10">
              <Button
                onClick={() => handleSave(platform)}
                className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90 disabled:opacity-50"
              >
                {savingPlatform === platform ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${platform} Agent Script`
                )}
              </Button>
              {savedPlatform === platform && (
                <div className="absolute left-0 right-0 top-0 flex items-center justify-center text-green-600 font-medium">
                  <Check className="w-4 h-4 mr-1" />
                  Settings Saved
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#7A99A8]">
      <Header username="John Doe" />
      <main className="container max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center text-white hover:text-gray-200"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-white">Admin Settings</h1>
        </div>
        <div className="space-y-10">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Script Regenerator</h2>
            <Separator className="my-4" />
            <div className="grid gap-6 md:grid-cols-2">
              {PLATFORMS_SCRIPT_REGENERATOR.map(renderPlatformCard)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
