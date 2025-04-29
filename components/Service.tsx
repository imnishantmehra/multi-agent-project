import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  "https://d437-2405-201-3009-d88a-3505-efb9-2801-239e.ngrok-free.app";

/**
 * Generic service for making API calls
 */
export const Service = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  formData: any = {},
  queryParams?: Record<string, string>,
  formUrlEncoded: boolean = false
): Promise<any> => {
  const queryString = queryParams
    ? `?${new URLSearchParams(queryParams).toString()}`
    : "";

  const url = `${API_BASE_URL}/${endpoint}${queryString}`;
  const token = localStorage.getItem("token");

  try {
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let dataToSend = formData;

    if (formData instanceof FormData) {
    } else if (formUrlEncoded) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      dataToSend = new URLSearchParams(formData).toString();
    } else {
      headers["Content-Type"] = "application/json";
    }

    const response: AxiosResponse = await axios({
      method,
      url,
      data: method !== "GET" ? dataToSend : undefined,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Error during API call to ${endpoint}:`, error);
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

      const customScripts = await generateCustomScripts(
        file,
        weeks,
        days,
        platformPostsObj
      );
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

/**
 * Call the /signup endpoint
 * @param name - User full name
 * @param email - User email
 * @param password - User password
 */
export const signupUser = async ({
  username,
  email,
  password,
  contact,
}: {
  username: string;
  email: string;
  password: string;
  contact: string;
}): Promise<any> => {
  try {
    const endpoint = "register";

    const payload = {
      username,
      email,
      password,
      contact,
    };

    const response = await Service(endpoint, "POST", payload);

    return {
      status: response?.status || "error",
      message: response?.message || "Something went wrong.",
    };
  } catch (error: any) {
    console.error("Error during signup:", error);

    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "An unexpected error occurred. Please try again.";

    return {
      status: "error",
      message: errorMessage,
    };
  }
};

export const verifyEmail = async ({
  email,
  otp_code,
}: {
  email: string;
  otp_code: string;
}): Promise<any> => {
  try {
    const endpoint = "verify-email";

    const payload = {
      username: email,
      otp_code,
    };

    const response = await Service(endpoint, "POST", payload);

    return {
      status: response?.status || "success",
      message: response?.message || "Email verified successfully",
    };
  } catch (error: any) {
    console.error("Error during email verification:", error);

    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "OTP verification failed. Please try again.";

    return {
      status: "error",
      message: errorMessage,
    };
  }
};

/**
 * Call the /login endpoint
 * @param email - User email
 * @param password - User password
 */
export const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<any> => {
  try {
    const endpoint = "login";

    const payload = {
      grant_type: "password",
      username,
      password,
      scope: "",
      client_id: "string",
      client_secret: "string",
    };

    const response = await Service(endpoint, "POST", payload, undefined, true);

    if (response?.access_token) {
      return {
        status: "success",
        token: response.access_token,
      };
    } else {
      console.error("Login failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message || response?.error || "Unexpected login response",
      };
    }
  } catch (error) {
    console.error("Error during login:", error);
    return {
      status: "error",
      message: "Login failed due to unexpected error.",
    };
  }
};

/**
 * Call the /resend-otp endpoint
 * @param email - User email
 */
export const resendotp = async ({ email }: { email: string }): Promise<any> => {
  try {
    const endpoint = "resend-otp";

    const payload = {
      email,
    };

    const response = await Service(endpoint, "POST", payload);

    if (response?.status === 200) {
      return {
        status: 200,
        message: response.message,
      };
    } else {
      console.error("OTP resend failed:", response?.message || response?.error);
      return {
        status: "error",
        message: response?.message || response?.error || "Unexpected response",
      };
    }
  } catch (error) {
    console.error("Error during resend OTP:", error);
    return {
      status: "error",
      message: "OTP resend failed due to unexpected error.",
    };
  }
};

/**
 * Call the /forget-password endpoint
 * @param email - User email
 */
export const forgetPassword = async ({
  email,
}: {
  email: string;
}): Promise<any> => {
  try {
    const endpoint = "forget-password";

    const payload = {
      email,
    };

    const response = await Service(endpoint, "POST", payload);

    if (response?.status === 200) {
      return {
        status: 200,
        message: response.message,
      };
    } else {
      console.error("OTP resend failed:", response?.message || response?.error);
      return {
        status: "error",
        message: response?.message || response?.error || "Unexpected response",
      };
    }
  } catch (error) {
    console.error("Error during resend OTP:", error);
    return {
      status: "error",
      message: "OTP resend failed due to unexpected error.",
    };
  }
};

/**
 * Call the /reset-password endpoint
 * @param email - User email
 * @param otp_code - OTP code sent to email
 * @param new_password - New password to set
 */
export const resetPassword = async ({
  email,
  otp_code,
  new_password,
}: {
  email: string;
  otp_code: string;
  new_password: string;
}): Promise<any> => {
  try {
    const endpoint = "reset-password";

    const payload = {
      email,
      otp_code,
      new_password,
    };

    const response = await Service(endpoint, "POST", payload);

    if (response?.status === 200) {
      return {
        status: 200,
        message: response.message,
      };
    } else {
      return {
        status: "error",
        message: response?.message || response?.error || "Unexpected response",
      };
    }
  } catch (error) {
    console.error("Error during reset password:", error);
    return {
      status: "error",
      message: "Reset password failed due to unexpected error.",
    };
  }
};

/**
 * Call the /linkedin/auth endpoint
 * @param urls - List of LinkedIn URLs
 */
export const linkedinConnect = async (): Promise<any> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    const response = await Service("linkedin/auth", "GET", {});

    if (response?.auth_url) {
      window.location.href = response.auth_url;
    } else {
      console.error("No auth_url in response");
    }
  } catch (error) {
    console.error("Error during LinkedIn connection:", error);
  }
};

/**
 * Call the /twitter/auth endpoint
 * @param urls - List of LinkedIn URLs
 */
export const twitterConnect = async (): Promise<any> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    const response = await Service("twitter/auth", "GET", {});
    console.log("Twitter auth response:", response);

    if (response?.redirect_url) {
      window.location.href = response.redirect_url;
    } else {
      console.error("No redirect_url in response");
    }
  } catch (error) {
    console.error("Error during LinkedIn connection:", error);
  }
};

/**
 * Call the /wordpress/auth endpoint
 * @param site_url - WordPress site URL
 * @param username - WordPress username
 * @param password - WordPress password
 */

export const wordpressConnect = async (
  site_url: string,
  username: string,
  password: string
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    const formBody = new URLSearchParams();
    formBody.append("site_url", site_url);
    formBody.append("username", username);
    formBody.append("password", password);

    const response = await fetch(`${API_BASE_URL}/wordpress/auth`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const data = await response.json();

    if (response.ok) {
      console.log("WordPress connected successfully:", data);
    } else {
      console.error("Failed to connect to WordPress:", data);
    }

    return data;
  } catch (error) {
    console.error("Error during WordPress connection:", error);
  }
};
