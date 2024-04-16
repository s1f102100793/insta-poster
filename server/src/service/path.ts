import { env } from "../env";
import { MemberName, convertToRomaji } from "./memberNameConverters";

function outputPath(member: MemberName, title: string, folder: string, suffix: string): string {
  const base = env.OUTPUT_PATH ?? '../output';
  return `${base}/${folder}/${member}_${title}${suffix}`;
}

export const path = {
  screenshotOutput: (member: MemberName, title: string): string =>
    outputPath(member, title, `${member}スクショ`, ".png"),

  removeFrameImageOutput: (member: MemberName, title: string): string =>
    outputPath(member, title, `${member}画像`, ".png"),

  firstPostImageOutput: (member: MemberName, title: string): string =>
    outputPath(member, title, "完成", "_1.png"),

  secondPostImageOutput: (member: MemberName, title: string): string =>
    outputPath(member, title, "完成", "_2.png"),

  firstPostImageEnd: (member: MemberName, title: string): string =>
    `complete/${convertToRomaji(member)}_${encodeURIComponent(title)}_1.png`,

  secondPostImageEnd: (member: MemberName, title: string): string =>
    `complete/${convertToRomaji(member)}_${encodeURIComponent(title)}_2.png`
};