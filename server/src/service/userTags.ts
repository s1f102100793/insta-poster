import { Member } from "../api";
import { TagPosition, getPositionCoordinates } from "./TagPosition";
import { convertToInstagramId } from "./memberName";

export const getUsertags = (members: Member[]) => {
  const positionCounts: Record<TagPosition, number> = {
    'bottom-left': 0,
    'bottom-right': 0,
    'top-right': 0,
    'top-left': 0,
    'bottom-center': 0
  };

  const userTags = members.map(member => {
    if (member.memberName !== "" && member.tagPosition !== "") {
      const instagramId = convertToInstagramId(member.memberName);
      const position = getPositionCoordinates(member.tagPosition, positionCounts[member.tagPosition]);
      positionCounts[member.tagPosition]++;
      return instagramId ? { username: instagramId, ...position } : null;
    }
  }).filter(tag => tag !== null);
  return userTags;
};