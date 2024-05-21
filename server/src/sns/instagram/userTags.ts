import { Member } from "../../api";
import { env } from "../../env";
import { TagPosition, getPositionCoordinates } from "../../service/TagPosition";
import { convertToInstagramId } from "../../service/memberName";

export const getInstagramUserTags = (members: Member[]) => {
  const positionCounts: Record<TagPosition, number> = {
    'bottom-left': 0,
    'bottom-right': 0,
    'top-right': 0,
    'top-left': 0,
    'bottom-center': 0
  };

  const memberTags = members.map(member => {
    if (member.memberName !== "" && member.tagPosition !== "") {
      const instagramId = convertToInstagramId(member.memberName);
      const position = getPositionCoordinates(member.tagPosition, positionCounts[member.tagPosition]);
      positionCounts[member.tagPosition]++;
      return instagramId ? { username: instagramId, ...position } : null;
    }
  }).filter(tag => tag !== null);
  const myTag = { username: env.INSTAGRAM_USER_NAME, x: 0.75, y: 0.89 };
  memberTags.push(myTag);
  return memberTags;
};