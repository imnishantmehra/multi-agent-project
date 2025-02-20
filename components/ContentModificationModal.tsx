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
} from "@/components/Service";

interface ContentModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (modifications: string) => void;
  contentType: "content" | "image" | "main" | "sub";
  subTopic: string;
}

export function ContentModificationModal({
  isOpen,
  onClose,
  onRegenerate,
  contentType,
  subTopic,
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
      const contentOnly = modifications.replace(/^[^:]+:\s*/, "").trim();

      let regeneratedResponse = await regenerateContent(contentOnly);

      if (contentType === "content") {
        regeneratedResponse = await regenerateScript(modifications);
      } else if (contentType === "sub") {
        regeneratedResponse = await regenerateSubContent(modifications);
      }

      console.log("regeneratedResponse", regeneratedResponse);

      if (regeneratedResponse?.status === "success") {
        let updatedContent = regeneratedResponse?.week_content || "";

        let mainContent = updatedContent
          .replace(/^["']?\s*week:\s*/i, "")
          .trim();
        let finalUpdatedText = `${mainContent}`;

        if (contentType === "content") {
          updatedContent = regeneratedResponse.content?.content || "";
          mainContent = updatedContent;
          finalUpdatedText = mainContent;
        } else if (contentType === "sub") {
          let updatedContent = regeneratedResponse?.subcontent || "";

          if (typeof updatedContent === "string") {
            try {
              const parsedContent = JSON.parse(updatedContent);
              updatedContent = parsedContent?.subcontent || updatedContent;
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }

          mainContent = updatedContent
            .replace(/.*day:\s*/i, "")
            .replace(/.*subcontent:\s*/i, "")
            .trim();

          const mainContent1 = mainContent.replace(/[{}]/g, "").trim();
          console.log("mainContent:", mainContent1);

          finalUpdatedText = `${mainContent1}`;
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
