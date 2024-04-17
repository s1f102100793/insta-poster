import { useRef, useState } from "react";
import { postsService } from "./shared/posts.service";
import { GenericSelect } from "./components/GenericSelect";
import { MemberName, memberColors, memberNames } from "./types/member";
import {
  TagPosition,
  tagPositions,
  translateTagPositionToEnglish,
} from "./types/tagPositions";
import { ImageUpload } from "./components/ImageUpload";
import { TextInput } from "./components/TextInput";

function App() {
  const [firstPostImage, setFirstPostImage] = useState<File | null>(null);
  const [secondCompositeImage, setSecondCompositeImage] = useState<File | null>(
    null,
  );
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberName>("てつや");
  const [tagPosition, setTagPosition] = useState<TagPosition>("左下");
  const [title, setTitle] = useState("");
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
  const isShortsUrl = (url: string): boolean => {
    return /youtube\.com\/shorts\/([^#&?]*).*/.test(url);
  };

  const postSns = async (): Promise<void> => {
    if (
      !selectedMember ||
      !youtubeUrl ||
      !title ||
      !tagPosition ||
      !firstPostImage ||
      !secondCompositeImage ||
      !screenshot
    ) {
      console.error("必須項目が入力されていません");
      return;
    }
    const formData = new FormData();
    formData.append("firstPostImage", firstPostImage);
    formData.append("secondCompositeImage", secondCompositeImage);
    formData.append("screenshot", screenshot);
    formData.append("member", selectedMember);
    formData.append("tagPosition", translateTagPositionToEnglish(tagPosition));
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

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen gap-6 ${memberColors[selectedMember]}`}
    >
      <div className="flex flex-row gap-6">
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
      <div className="flex flex-col w-72 gap-6">
        <TextInput
          value={youtubeUrl}
          setValue={setYoutubeUrl}
          placeholder="YouTubeのURLを入力"
        />
        {youtubeUrl && (
          <>
            {!isShortsUrl(youtubeUrl) && (
              <iframe
                className="bg-white"
                title="YouTube video player"
                src={getEmbedUrl(youtubeUrl)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col w-72 gap-6">
        <GenericSelect<MemberName>
          value={selectedMember}
          options={memberNames}
          onChange={setSelectedMember}
          placeholder="メンバーを選択"
        />
        <GenericSelect<TagPosition>
          value={tagPosition}
          options={tagPositions}
          onChange={setTagPosition}
          placeholder="タグの位置を選択"
        />
      </div>
      <div className="flex flex-col w-72 gap-6">
        <TextInput
          value={title}
          setValue={setTitle}
          placeholder="タイトルを入力"
        />
      </div>
      <div className="flex flex-col w-72 gap-6">
        <button
          onClick={postSns}
          className="justify-end p-1 border border-solid rounded cursor-pointer hover:bg-gray-300"
        >
          作成する
        </button>
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
  );
}

export default App;
