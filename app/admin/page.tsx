"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  RotateCw,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  plateformScriptAgent,
  plateformScriptTask,
  regenerateContentAgent,
  regenerateContentTask,
} from "@/components/Service";

interface PlatformConnection {
  role?: string;
  goal?: string;
  backstory?: string;
  description?: string;
  expected_output?: string;
}

const PLATFORMS_SCRIPT_REGENERATOR = [
  // "Instagram",
  // "Facebook",
  // "YouTube",
  // "Twitter",
  // "LinkedIn",
  // "WordPress",
  // "TikTok",
  "Script_Research",
  "QC",
  "Script_Rewriter",
  "Regenrate_Content",
  "Regenrate_Subcontent",
];

export default function AccountSettings() {
  const [mergedData, setMergedData] = useState<
    (PlatformConnection & { platform: string })[]
  >([]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);

  const fetchAgentScripts = useCallback(async () => {
    try {
      setLoading(true);
      const [agentResponses, taskResponses] = await Promise.all([
        Promise.all(
          PLATFORMS_SCRIPT_REGENERATOR.map((platform) =>
            plateformScriptAgent(platform.toLowerCase()).catch(() =>
              Promise.resolve({ role: "", goal: "", backstory: "" })
            )
          )
        ),
        Promise.all(
          PLATFORMS_SCRIPT_REGENERATOR.map((platform) =>
            plateformScriptTask(platform.toLowerCase()).catch(() =>
              Promise.resolve({ description: "", expected_output: "" })
            )
          )
        ),
      ]);

      const merged = PLATFORMS_SCRIPT_REGENERATOR.map((platform, index) => ({
        platform,
        ...agentResponses[index],
        ...taskResponses[index],
      }));
      setMergedData(merged);
    } catch {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgentScripts();
  }, [fetchAgentScripts]);

  const handleRegenerate = async (
    platformData: PlatformConnection & { platform: string }
  ) => {
    setSavingPlatform(platformData.platform);
    setSuccessMessage("");

    try {
      await regenerateContentAgent({
        agentName: platformData.platform.toLowerCase(),
        role: platformData.role || "",
        goal: platformData.goal || "",
        backstory: platformData.backstory || "",
      });

      await regenerateContentTask({
        agentName: platformData.platform.toLowerCase(),
        description: platformData.description || "",
        expectedOutput: platformData.expected_output || "",
      });

      setSuccessMessage(
        "Task updated successfully. Database re-initialized with latest definitions."
      );

      setTimeout(() => {
        fetchAgentScripts();
      }, 5000);

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (error) {
      console.error(
        "Error regenerating content for",
        platformData.platform,
        error
      );
    } finally {
      setSavingPlatform(null);
    }
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
              {mergedData.map((platformData) => (
                <Card key={platformData.platform}>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      <strong>{platformData.platform}</strong> Agent Script
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
                      Object.keys(platformData).map(
                        (key) =>
                          key !== "platform" && (
                            <div key={key} className="space-y-2">
                              <h3 className="text-[1.1rem] font-semibold">
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </h3>
                              <textarea
                                value={
                                  platformData[
                                    key as keyof PlatformConnection
                                  ] || ""
                                }
                                onChange={(e) =>
                                  setMergedData((prev) =>
                                    prev.map((item) =>
                                      item.platform === platformData.platform
                                        ? { ...item, [key]: e.target.value }
                                        : item
                                    )
                                  )
                                }
                                className="border rounded-md p-2 w-full focus:ring-1 focus:ring-[#020817] focus:border-transparent text-sm min-h-[100px]"
                                rows={5}
                              />
                            </div>
                          )
                      )
                    )}
                    {!loading && !error && (
                      <Button
                        onClick={() => handleRegenerate(platformData)}
                        className="w-full bg-[#3d545f] text-white hover:bg-[#3d545f]/90 disabled:opacity-50"
                        disabled={savingPlatform === platformData.platform}
                      >
                        {savingPlatform === platformData.platform ? (
                          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Update"
                        )}
                      </Button>
                    )}
                    {successMessage && (
                      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center">
                        <Check className="w-4 h-4 mr-2" />
                        {successMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
