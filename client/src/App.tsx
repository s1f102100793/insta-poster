import { useRef, useState } from "react";
import { postsService } from "./shared/posts.service";
import { GenericSelect } from "./components/GenericSelect";
import { MemberName, memberNames } from "./types/member";
import {
  TagPosition,
  tagPositions,
  translateTagPositionToEnglish,
} from "./types/tagPositions";
import { ImageUpload } from "./components/ImageUpload";
import { TextInput } from "./components/TextInput";
import { BackgroundLayers } from "./components/BackgroundLayers";

export interface Member {
  memberName: MemberName | "";
  tagPosition: TagPosition | "";
}

function App() {
  const [firstPostImage, setFirstPostImage] = useState<File | null>(null);
  const [secondCompositeImage, setSecondCompositeImage] = useState<File | null>(
    null,
  );
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=0jHP8gtHtn0&t=1132s&ab_channel=%E6%9D%B1%E6%B5%B7%E3%82%AA%E3%83%B3%E3%82%A8%E3%82%A2");
  const [members, setMembers] = useState<Member[]>([
    { memberName: "てつや", tagPosition: "左下" },
  ]);
  const [title, setTitle] = useState("テスト");
  const [instagramPostText, setInstagramPostText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const getEmbedUrl = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  const postSns = async (): Promise<void> => {
    if (
      !youtubeUrl ||
      !title ||
      !firstPostImage ||
      !secondCompositeImage ||
      !screenshot ||
      members.some((member) => !member.memberName || !member.tagPosition)
    ) {
      alert("必須項目が入力されていません");
      console.error("必須項目が入力されていません");
      return;
    }
    const formData = new FormData();
    formData.append("firstPostImage", firstPostImage);
    formData.append("secondCompositeImage", secondCompositeImage);
    formData.append("screenshot", screenshot);
    members.forEach((member, index) => {
      if (member.tagPosition !== "") {
        formData.append(`members[${index}][memberName]`, member.memberName!);
        formData.append(
          `members[${index}][tagPosition]`,
          translateTagPositionToEnglish(member.tagPosition!),
        );
      } else {
        console.error("Invalid member data");
        alert("Invalid member data");
      }
    });
    formData.append("youtubeUrl", youtubeUrl);
    formData.append("title", title);

    try {
      const response = await postsService.postSns(formData);
      const result = await response.text();
      setInstagramPostText(result);
    } catch (error) {
      console.error("Error posting data", error);
    }
  };

  const copyToClipboard = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    textArea.select();
    document.execCommand("copy");
  };

  const handleMemberChange = (
    index: number,
    key: keyof Member,
    value: string,
  ) => {
    const updatedMembers = members.map((m, i) =>
      i === index ? { ...m, [key]: value } : m,
    );
    setMembers(updatedMembers);
  };
  const addMember = () => {
    setMembers([...members, { memberName: "", tagPosition: "" }]);
  };
  const removeMember = () => {
    if (members.length > 1) {
      setMembers(members.slice(0, members.length - 1));
    }
  };

  const getAvailableMembers = (currentIndex: number) => {
    const selectedMembers = new Set(members.map((member) => member.memberName));
    selectedMembers.delete(members[currentIndex].memberName);
    return memberNames.filter((memberName) => !selectedMembers.has(memberName));
  };

  return (
    <div className="relative w-full min-h-screen">
      <BackgroundLayers members={members} />
      <div
        className={`flex flex-col items-center justify-center min-h-screen gap-6`}
      >
        <div className="flex flex-row gap-6 border-2 border-white p-2 padding h-[400px]">
          <ImageUpload
            image={firstPostImage}
            setImage={setFirstPostImage}
            label="投稿1枚目"
            id="firstPostImage"
          />
          <ImageUpload
            image={secondCompositeImage}
            setImage={setSecondCompositeImage}
            label="投稿2枚目の合成用"
            id="secondCompositeImage"
          />
          <ImageUpload
            image={screenshot}
            setImage={setScreenshot}
            label="スクリーンショット"
            id="screenshot"
          />
        </div>
        <div className="flex flex-row gap-6 border-2 border-white p-2 padding">
          <div className="flex flex-col w-72 gap-6">
            <TextInput
              value={youtubeUrl}
              setValue={setYoutubeUrl}
              placeholder="YouTubeのURLを入力"
            />
            <iframe
              className="bg-white"
              title="YouTube video player"
              src={getEmbedUrl(youtubeUrl)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="flex flex-col items-center gap-6">
            {members.map((member, index) => (
              <div key={index} className="flex flex-col w-72 gap-6">
                <GenericSelect<MemberName>
                  value={member.memberName}
                  options={getAvailableMembers(index)}
                  onChange={(value) =>
                    handleMemberChange(index, "memberName", value)
                  }
                  placeholder="メンバーを選択"
                />
                <GenericSelect<TagPosition>
                  value={member.tagPosition}
                  options={tagPositions}
                  onChange={(value) =>
                    handleMemberChange(index, "tagPosition", value)
                  }
                  placeholder="タグの位置を選択"
                />
              </div>
            ))}
            <button
              onClick={removeMember}
              className="bg-red-500 w-full text-white p-2 rounded"
            >
              削除
            </button>
            <button
              onClick={addMember}
              className="bg-green-500 w-full text-white p-2 rounded"
            >
              メンバーを追加
            </button>
          </div>
          <div className="flex flex-col w-72 gap-6">
            <TextInput
              value={title}
              setValue={setTitle}
              placeholder="タイトルを入力"
            />
            <button
              onClick={postSns}
              className="justify-end p-1 border border-solid rounded cursor-pointer hover:bg-gray-300"
            >
              作成する
            </button>
          </div>
        </div>
        {instagramPostText && (
          <div className="flex flex-col w-72 gap-6">
            <textarea
              ref={textAreaRef}
              value={instagramPostText}
              readOnly
              className="textarea"
            />
            <button
              onClick={copyToClipboard}
              className="justify-end p-1 border border-solid rounded cursor-pointer hover:bg-gray-300"
            >
              コピー
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
