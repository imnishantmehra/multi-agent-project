import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  "https://9573-2405-201-3009-d88a-3998-7279-1e3d-aabb.ngrok-free.app";

/**
 * Generic service for making API calls
 * @param endpoint - API endpoint
 * @param method - HTTP method (POST, PUT, GET, DELETE)
 * @param formData - Data to be sent (either FormData or JSON object)
 * @param queryParams - Query parameters (optional)
 */
export const Service = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
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
  const endpoint = "generate_custom_scripts";
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
 * Call the /regenerate_script endpoint
 * @param content - The content to regenerate
 */
export const regenerateScript = async (content: string): Promise<any> => {
  try {
    const endpoint = "regenerate_script";

    const timestamp = new Date().getTime().toString();

    const cleanedContent = decodeURIComponent(content);

    const queryParams: Record<string, string> = {
      content: cleanedContent,
      timestamp,
    };

    const response = await Service(endpoint, "PUT", {}, queryParams);

    if (response?.status === "success") {
      if (typeof response.content === "string") {
        const decodedContent = decodeURIComponent(response.content);
        return { ...response, content: decodedContent };
      } else if (typeof response.content === "object") {
        return { ...response, content: response.content };
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
