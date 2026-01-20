import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar() {
  return (
    <Avatar className="cursor-pointer">
      <AvatarFallback>CA</AvatarFallback>
    </Avatar>
  );
}