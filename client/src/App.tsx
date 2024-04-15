import { useRef, useState } from "react";
import { postsService } from "./shared/posts.service";

function App() {
  const [firstPostImage, setFirstPostImage] = useState<File | null>(null);
  const [secondCompositeImage, setSecondCompositeImage] = useState<File | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedMember, setSelectedMember] = useState("てつや");
  const [tagPosition, setTagPosition] = useState("bottom-left");
  const [title, setTitle] = useState("");
  const [instagramPostText, setInstagramPostText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const memberColors: Record<string, string> = {
    てつや: "bg-orange-200",
    しばゆー: "bg-yellow-200",
    りょう: "bg-blue-200",
    としみつ: "bg-green-200",
    ゆめまる: "bg-pink-200",
    虫眼鏡: "bg-yellow-900",
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(event.target.value);
  };
  const handleMemberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMember(event.target.value);
  };
  const handleTagPositionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTagPosition(event.target.value);
  };
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  const getImageUrl = (image: File | null) =>
    image ? URL.createObjectURL(image) : "";
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
    if (!selectedMember || !youtubeUrl || !title || !firstPostImage || !secondCompositeImage || !screenshot) {
      console.error("必須項目が入力されていません");
      return;
    }
    const formData = new FormData();
    formData.append("firstPostImage", firstPostImage);
    formData.append("secondCompositeImage", secondCompositeImage);
    formData.append("screenshot", screenshot);
    formData.append("member", selectedMember);
    formData.append("tagPosition", tagPosition);
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
    document.execCommand('copy');
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen gap-6 ${memberColors[selectedMember]}`}
    >
      <div className="flex flex-row gap-6">
        <div className="flex flex-col justify-end gap-4">
          {firstPostImage && (
            <img src={getImageUrl(firstPostImage)} alt="Image 1" className="w-72" />
          )}
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setFirstPostImage)}
            className="p-1"
          />
          <label htmlFor="firstPostImage-input" className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-300">投稿1枚目</label>
        </div>
        <div className="flex flex-col justify-end gap-4">
          {secondCompositeImage && (
            <img src={getImageUrl(secondCompositeImage)} alt="Image 2" className="w-72" />
          )}
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setSecondCompositeImage)}
            className="p-1"
          />  
          <label htmlFor="secondCompositeImage-input" className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-300">投稿2枚目の合成用</label>
        </div>
        <div className="flex flex-col justify-end gap-4">
          {screenshot && (
            <img src={getImageUrl(screenshot)} alt="screenshot" className="w-72" />
          )}
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setScreenshot)}
            className="p-1"
          />
          <label htmlFor="screenshot-input" className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-300">スクリーンショット</label>
        </div>
      </div>
      <div className="flex flex-col w-72 gap-6">
        <input
          type="text"
          value={youtubeUrl}
          onChange={handleUrlChange}
          placeholder="YouTube URLを入力"
          className="p-1"
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
        <select
          value={selectedMember}
          onChange={handleMemberChange}
          className="p-1"
        >
          <option value="">メンバーを選択</option>
          <option value="てつや">てつや</option>
          <option value="しばゆー">しばゆー</option>
          <option value="りょう">りょう</option>
          <option value="としみつ">としみつ</option>
          <option value="ゆめまる">ゆめまる</option>
          <option value="虫眼鏡">虫眼鏡</option>
        </select>
      </div>
      <div className="flex flex-col w-72 gap-6">
        <select
          id="tag-position-select"
          value={tagPosition}
          onChange={handleTagPositionChange}
          className="p-1"
        >
          <option value="">タグの位置を選択</option>
          <option value="bottom-left">左下</option>
          <option value="bottom-right">右下</option>
          <option value="top-right">右上</option>
          <option value="top-left">左上</option>
        </select>
      </div>
      <div className="flex flex-col w-72 gap-6">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="タイトルを入力"
          className="p-1"
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
