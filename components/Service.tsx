import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "https://multiagent-933293844713.us-central1.run.app";

/**
 * Generic service for making API calls
 * @param endpoint - API endpoint
 * @param method - HTTP method (POST, PUT, GET, DELETE)
 * @param formData - Data to be sent (either FormData or JSON object)
 * @param queryParams - Query parameters (optional)
 */
export const Service = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  formData: any,
  queryParams?: Record<string, string>
): Promise<any> => {
  const queryString = queryParams
    ? `?${new URLSearchParams(queryParams).toString()}`
    : "";
  const url = `${API_BASE_URL}/${endpoint}${queryString}`;

  try {
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
    };

    if (formData instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }

    const response: AxiosResponse = await axios({
      method,
      url,
      data: formData,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Error during API call to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Call the /extract_content endpoint
 * @param file - File to upload
 * @param week - Week parameter
 * @param days - Days parameter
 */
export const extractContent = async (
  file: File,
  week: number,
  days: string
): Promise<any> => {
  const endpoint = "extract_content";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("week", week.toString());
  formData.append("days", days);

  return await Service(endpoint, "POST", formData);
};

/**
 * Call the /generate_custom_scripts endpoint
 * @param file - File to upload
 * @param weeks - Weeks parameter
 * @param days - Days parameter
 * @param platformPosts - Object representing platform posts (e.g., { instagram: 1 })
 */
export const generateCustomScripts = async (
  file: File,
  weeks: number,
  days: string[],
  platformPosts: { [key: string]: number }
): Promise<any> => {
  // const endpoint = "generate_custom_scripts";
  const endpoint = "generate_custom_scripts_v2";
  const formData = new FormData();
  formData.append("file", file);

  const queryParams = {
    weeks: weeks.toString(),
    days: days.join(","),
    platform_posts: Object.entries(platformPosts)
      .map(([key, value]) => `${key}:${value}`)
      .join(","),
  };

  return await Service(endpoint, "POST", formData, queryParams);
};

(async () => {
  try {
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    fileInput.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (!file) {
        console.error("No file selected!");
        return;
      }

      const weeks = Number(prompt("Enter the number of weeks:", "1"));
      const days = prompt("Enter the days (comma-separated):", "Monday,Tuesday")
        ?.split(",")
        .map((day) => day.trim()) || ["Monday"];
      const platformPosts = prompt(
        'Enter platform posts as JSON (e.g., {"instagram": 1}):',
        '{"instagram": 1}'
      );
      const platformPostsObj = platformPosts ? JSON.parse(platformPosts) : {};

      const extractedContent = await extractContent(file, weeks, days[0]);
      console.log("Extracted Content Response:", extractedContent);

      const customScripts = await generateCustomScripts(
        file,
        weeks,
        days,
        platformPostsObj
      );
      console.log("Custom Scripts Response:", customScripts);
    };

    fileInput.click();
  } catch (error) {
    console.error("Error during API calls:", error);
  }
})();

/**
 * Call the /regenerate_script_v1 endpoint
 * @param params - Object containing content, query, and platform
 */

export const regenerateScript = async ({
  subTopic,
  modifications,
  platform,
}: {
  subTopic: string;
  modifications: string;
  platform: string;
}): Promise<any> => {
  try {
    const endpoint = "regenerate_script_v1";

    const timestamp = new Date().getTime().toString();
    const cleanedContent = decodeURIComponent(subTopic);

    const queryParams: Record<string, string> = {
      content: cleanedContent,
      query: modifications,
      platform,
      timestamp,
    };

    const response = await Service(endpoint, "PUT", {}, queryParams);

    if (response?.status === "success") {
      // Extract content properly
      const decodedContent =
        typeof response.content === "object"
          ? response.content.content || ""
          : response.content || "";

      return { ...response, content: decodedContent };
    } else {
      console.error("Failed to regenerate script:", response?.message);
      return null;
    }
  } catch (error) {
    console.error("Error during script regeneration:", error);
    return null;
  }
};

/**
 * Call the /regenerate_content endpoint
 * @param week_content - The week_content to regenerate
 */
export const regenerateContent = async (content: string): Promise<any> => {
  try {
    const endpoint = "regenerate_content";

    const timestamp = new Date().getTime().toString();

    const cleanedContent = decodeURIComponent(content);

    const queryParams: Record<string, string> = {
      week_content: cleanedContent,
      timestamp,
    };

    const response = await Service(endpoint, "POST", {}, queryParams);

    if (response?.status === "success") {
      if (typeof response.week_content === "string") {
        const decodedContent = decodeURIComponent(response.week_content);
        return { ...response, week_content: decodedContent };
      }
    } else {
      console.error("Failed to regenerate script:", response?.message);
      return null;
    }
  } catch (error) {
    console.error("Error during script regeneration:", error);
    return null;
  }
};

/**
 * Call the /regenerate_subcontent endpoint
 * @param subcontent - The subcontent to regenerate
 */
export const regenerateSubContent = async (content: string): Promise<any> => {
  try {
    const endpoint = "regenerate_subcontent";

    const timestamp = new Date().getTime().toString();

    const cleanedContent = decodeURIComponent(content);

    const queryParams: Record<string, string> = {
      subcontent: cleanedContent,
      timestamp,
    };

    const response = await Service(endpoint, "POST", {}, queryParams);

    if (response?.status === "success") {
      if (typeof response.subcontent === "string") {
        const decodedContent = decodeURIComponent(response.subcontent);
        return { ...response, subcontent: decodedContent };
      }
    } else {
      console.error("Failed to regenerate script:", response?.message);
      return null;
    }
  } catch (error) {
    console.error("Error during script regeneration:", error);
    return null;
  }
};

/**
 * Call the /config/${agent_name}_agent endpoint
 * @param Role
 * @param goal
 * @param backstory
 */
export const plateformScriptAgent = async (
  agent_name: string
): Promise<any> => {
  try {
    const endpoint = `config/${agent_name}_agent`;
    const response = await Service(endpoint, "GET", {});

    return response.current;
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error during script regeneration for ${agent_name}:`,
        error.message
      );
    } else {
      console.error(
        `Unknown error during script regeneration for ${agent_name}:`,
        error
      );
    }
    return null;
  }
};

/**
 * Call the /config/${agent_name}_task endpoint
 * @param Role
 * @param goal
 * @param backstory
 */
export const plateformScriptTask = async (agent_name: string): Promise<any> => {
  try {
    const endpoint = `config/${agent_name}_task`;
    const response = await Service(endpoint, "GET", {});

    return response.current;
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error during script regeneration for ${agent_name}:`,
        error.message
      );
    } else {
      console.error(
        `Unknown error during script regeneration for ${agent_name}:`,
        error
      );
    }
    return null;
  }
};

/**
 * Call the /regenrate_subcontent_task endpoint
 * @param params - Object containing agentName, description, and expectedOutput
 */

export const regenerateContentTask = async ({
  agentName,
  description,
  expectedOutput,
}: {
  agentName: string;
  description: string;
  expectedOutput: string;
}): Promise<any> => {
  try {
    const endpoint = `tasks/${agentName}_task`;

    const payload = {
      description,
      expected_output: expectedOutput,
    };

    const response = await Service(endpoint, "PUT", payload, {});

    if (response?.status === "success") {
      return response;
    } else {
      console.error("Failed to regenerate subcontent:", response?.message);
      return null;
    }
  } catch (error) {
    console.error("Error during subcontent regeneration:", error);
    return null;
  }
};

/**
 * Call the /regenrate_subcontent_agent endpoint
 * @param params - Object containing agentName, role, goal, and backstory
 */

export const regenerateContentAgent = async ({
  agentName,
  role,
  goal,
  backstory,
}: {
  agentName: string;
  role: string;
  goal: string;
  backstory: string;
}): Promise<any> => {
  try {
    const endpoint = `agents/${agentName}_agent`;

    const payload = {
      role,
      goal,
      backstory,
    };

    const response = await Service(endpoint, "PUT", payload, {});

    if (response?.status === "success") {
      return response;
    } else {
      console.error("Failed to regenerate subcontent:", response?.message);
      return null;
    }
  } catch (error) {
    console.error("Error during subcontent agent regeneration:", error);
    return null;
  }
};

/**
 * Call the /generate_image endpoint
 * @param params - Object containing content, query, and platform
 */
export const generateImage = async ({
  subTopic,
  modifications,
}: {
  subTopic: string;
  modifications: string;
}): Promise<any> => {
  try {
    const endpoint = "generate_image";

    const timestamp = new Date().getTime().toString();
    const cleanedContent = decodeURIComponent(subTopic);

    const queryParams: Record<string, string> = {
      content: cleanedContent,
      query: modifications,
      timestamp,
    };

    const response = await Service(endpoint, "POST", {}, queryParams);

    if (response?.status === "success") {
      return response;
    } else {
      console.error("Failed to generate image:", response?.message);
      return null;
    }
  } catch (error) {
    console.error("Error during image generation:", error);
    return null;
  }
};

/**
 * Call the /content/schedule-time endpoint
 * @param content - The text content to be scheduled
 * @param newTime - The new time for scheduling
 */
export const scheduleTime = async ({
  newTime,
  content,
}: {
  newTime: string;
  content: string;
}): Promise<any> => {
  try {
    const encodedContent = encodeURIComponent(content);

    const endpoint = `content/schedule-time?content=${encodedContent}`;

    const body = {
      new_time: newTime,
    };

    const response = await Service(endpoint, "PATCH", body);
    return response;
  } catch (error) {
    console.error("Error scheduling content:", error);
    return null;
  }
};

/**
 * Call the /content/schedule-time endpoint
 * @param content - The text content to be scheduled
 * @param newTime - The new time for scheduling
 */
export const duplicateScheduleTime = async ({
  source_week,
  source_day,
  platform,
}: {
  source_week: number;
  source_day: string;
  platform: string;
}): Promise<any> => {
  try {
    const endpoint = `duplicate-schedule-times`;

    const body = {
      source_week,
      source_day,
      platform,
    };

    const response = await Service(endpoint, "POST", body);
    return response;
  } catch (error) {
    console.error("Error scheduling content:", error);
    return null;
  }
};
