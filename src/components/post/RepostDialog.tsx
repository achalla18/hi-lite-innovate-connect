
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import CreatePostForm from "./CreatePostForm";
import { Button } from "@/components/ui/button";

interface RepostDialogProps {
  postId: string;
  postContent: string;
  userName: string;
  userId: string;
}

export default function RepostDialog({ 
  postId,
  postContent,
  userName,
  userId
}: RepostDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Repost</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repost</DialogTitle>
        </DialogHeader>
        <CreatePostForm 
          repostId={postId}
          repostContent={postContent}
          repostUser={{ name: userName, id: userId }}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
