import { CSSProperties } from "react";
import { MemberName } from "../../../server/src/service/memberName";
import { memberColors } from "../types/member";
import { Member } from "../HomePage";

type BackgroundLayersProps = {
  members: Member[];
};

export const BackgroundLayers = ({ members }: BackgroundLayersProps) => {
  const numberOfMembers = members.length;
  if (numberOfMembers === 0) {
    return null;
  }

  return members.map((member, index) => {
    const colorClass =
      memberColors[member.memberName as MemberName] || "bg-gray-200";
    const width = 100 / numberOfMembers;
    const left = width * index;
    const style: CSSProperties = {
      position: "absolute",
      width: `${width}%`,
      height: "100%",
      left: `${left}%`,
      zIndex: -1,
    };
    return <div key={index} className={colorClass} style={style}></div>;
  });
};
