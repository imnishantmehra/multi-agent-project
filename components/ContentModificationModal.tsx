import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  regenerateScript,
  regenerateContent,
  regenerateSubContent,
  generateImage,
} from "@/components/Service";

interface ContentModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (modifications: string) => void;
  contentType: "content" | "image" | "main" | "sub";
  subTopic: string;
  platform: string;
}

export function ContentModificationModal({
  isOpen,
  onClose,
  onRegenerate,
  contentType,
  subTopic,
  platform,
}: ContentModificationModalProps) {
  const [modifications, setModifications] = useState(subTopic);
  const [isRegenerating, setIsRegenerating] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setModifications(subTopic);
    }
  }, [isOpen, subTopic]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);

    try {
      // const contentOnly = modifications.replace(/^[^:]+:\s*/, "").trim();

      let regeneratedResponse;

      if (contentType === "content") {
        regeneratedResponse = await regenerateScript({
          subTopic,
          modifications,
          platform,
        });

        if (regeneratedResponse?.status === "success") {
          const updatedContent =
            typeof regeneratedResponse?.content === "object"
              ? regeneratedResponse?.content?.content || ""
              : regeneratedResponse?.content || "";

          // console.log("Updated Content:", updatedContent);
          if (!updatedContent) {
            console.error("Updated content is empty or undefined!");
          }

          setModifications(updatedContent);
          onRegenerate(updatedContent);
          onClose();
        } else {
          console.error(
            "Failed to regenerate script:",
            regeneratedResponse?.message
          );
        }
      } else if (contentType === "image") {
        regeneratedResponse = await generateImage({
          subTopic,
          modifications,
        });

        if (regeneratedResponse?.status === "success") {
          setModifications(regeneratedResponse?.image_url);
          onRegenerate(regeneratedResponse?.image_url);
          onClose();
        } else {
          console.error(
            "Failed to regenerate script:",
            regeneratedResponse?.message
          );
        }
      } else if (contentType === "sub") {
        regeneratedResponse = await regenerateSubContent(modifications);
      } else {
        const contentOnly = modifications.replace(/^[^:]+:\s*/, "").trim();

        regeneratedResponse = await regenerateContent(contentOnly);
      }

      if (regeneratedResponse?.status === "success") {
        let updatedContent;

        let mainContent;
        let finalUpdatedText;

        if (contentType === "content") {
          updatedContent = regeneratedResponse.content?.content || "";
          mainContent = updatedContent;
          finalUpdatedText = mainContent;
        } else if (contentType === "sub") {
          let updatedContent = regeneratedResponse?.subcontent || "";

          updatedContent = updatedContent
            .trim()
            .replace(/^["']?\s*week:\s*/i, "");

          if (typeof updatedContent === "string") {
            try {
              if (
                updatedContent.startsWith("{") ||
                updatedContent.startsWith("[")
              ) {
                const parsedContent = JSON.parse(updatedContent);
                updatedContent = parsedContent?.subcontent || updatedContent;
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }

          mainContent = updatedContent
            .replace(/.*day:\s*/i, "")
            .replace(/.*subcontent:\s*/i, "")
            .trim();

          const mainContent1 = mainContent.replace(/[{}]/g, "").trim();

          finalUpdatedText = `${mainContent1}`;
        } else if (contentType === "main") {
          updatedContent = regeneratedResponse?.week_content || "";

          mainContent = updatedContent.replace(/^["']?\s*week:\s*/i, "").trim();
          finalUpdatedText = `${mainContent}`;
        }

        setModifications(finalUpdatedText);
        onRegenerate(finalUpdatedText);

        onClose();
      } else {
        console.error(
          "Failed to regenerate script:",
          regeneratedResponse?.message
        );
      }
    } catch (error) {
      console.error("Error during script regeneration:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Modify{" "}
            {contentType === "main"
              ? "Main Idea "
              : contentType === "sub"
              ? "Sub-topic"
              : contentType === "content"
              ? "Content"
              : "Image"}
          </DialogTitle>
          <DialogDescription>
            Describe the modifications you'd like to make to the{" "}
            {contentType === "main"
              ? "main idea"
              : contentType === "sub"
              ? "sub-topic"
              : contentType}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="modifications"
            // value={subTopic}
            value={modifications}
            onChange={(e) => setModifications(e.target.value)}
            placeholder={`Enter your desired modifications for the ${
              contentType === "main"
                ? "main idea"
                : contentType === "sub"
                ? "sub-topic"
                : contentType
            }...`}
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRegenerate}
            type="button"
            disabled={isRegenerating}
          >
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
