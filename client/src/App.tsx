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
import { Button } from "./components/Button";

export interface Member {
  memberName: MemberName | "";
  tagPosition: TagPosition | "";
}

type PostImageCount = 1 | 2;

function App() {
  const [firstPostImage, setFirstPostImage] = useState<File | null>(null);
  const [secondCompositeImage, setSecondCompositeImage] = useState<File | null>(
    null,
  );
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [members, setMembers] = useState<Member[]>([
    { memberName: "", tagPosition: "" },
  ]);
  const [title, setTitle] = useState("");
  const [additionalHashTag, setAdditionalHashTag] = useState("");
  const [postImageCount, setPostImageCount] = useState<PostImageCount | null>(
    null,
  );
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
      !postImageCount ||
      members.some((member) => !member.memberName || !member.tagPosition)
    ) {
      alert("必須項目が入力されていません");
      console.error("必須項目が入力されていません");
      return;
    }

    const isSingleImageRequired = postImageCount === 1 && !firstPostImage;
    const isTripleImageRequired =
      postImageCount === 2 &&
      (!firstPostImage || !secondCompositeImage || !screenshot);

    const canAppendSingleImage = postImageCount === 1 && firstPostImage;
    const canAppendTripleImages =
      postImageCount === 2 &&
      firstPostImage &&
      secondCompositeImage &&
      screenshot;

    if (isSingleImageRequired || isTripleImageRequired) {
      alert("必要な画像がすべて設定されていません");
      console.error("必要な画像がすべて設定されていません");
      return;
    }

    const formData = new FormData();

    if (canAppendSingleImage) {
      formData.append("firstPostImage", firstPostImage);
    } else if (canAppendTripleImages) {
      formData.append("firstPostImage", firstPostImage);
      formData.append("secondCompositeImage", secondCompositeImage);
      formData.append("screenshot", screenshot);
    }
    if (additionalHashTag !== "") {
      formData.append("additionalHashTag", additionalHashTag);
    }

    members.forEach((member, index) => {
      if (member.tagPosition !== "") {
        formData.append(`members[${index}][memberName]`, member.memberName);
        formData.append(
          `members[${index}][tagPosition]`,
          translateTagPositionToEnglish(member.tagPosition),
        );
      } else {
        console.error("Invalid member data");
        alert("Invalid member data");
      }
    });
    formData.append("youtubeUrl", youtubeUrl);
    formData.append("title", title);
    formData.append("postImageCount", postImageCount.toString());

    try {
      alert("作成しました");
      const response = await postsService.postSns(formData);
      const result = await response.text();
      setInstagramPostText(result);
      alert("投稿が正常に送信されました");
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
        <div className="flex flex-row gap-6 border-2 border-white p-3 padding h-[400px]">
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
        <div className="flex flex-row gap-6 border-2 border-white p-3 padding">
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
                  options={getAvailableMembers(index).map((name) => ({
                    value: name,
                    label: name,
                  }))}
                  onChange={(value) =>
                    handleMemberChange(index, "memberName", value)
                  }
                  placeholder="メンバーを選択"
                />
                <GenericSelect<TagPosition>
                  value={member.tagPosition}
                  options={tagPositions.map((pos) => ({
                    value: pos,
                    label: pos,
                  }))}
                  onChange={(value) =>
                    handleMemberChange(index, "tagPosition", value)
                  }
                  placeholder="タグの位置を選択"
                />
              </div>
            ))}
            <Button color="bg-red-500" text="削除" onClick={removeMember} />
            <Button
              color="bg-green-500"
              text="メンバーを追加"
              onClick={addMember}
            />
          </div>
          <div className="flex flex-col w-72 gap-6">
            <GenericSelect<PostImageCount>
              value={postImageCount}
              options={[
                { value: 1, label: "一枚" },
                { value: 2, label: "二枚" },
              ]}
              onChange={setPostImageCount}
              placeholder="投稿画像の枚数を選択"
            />
            <TextInput
              value={title}
              setValue={setTitle}
              placeholder="タイトルを入力"
            />
            <TextInput
              value={additionalHashTag}
              setValue={setAdditionalHashTag}
              placeholder="追加のハッシュタグがあれば入力"
            />
            <Button color="bg-blue-500" text="作成する" onClick={postSns} />
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
