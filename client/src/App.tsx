import { useState } from "react";
import { postsService } from "./shared/posts.service";

function App() {
  const [image1, setImage1] = useState<File | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedMember, setSelectedMember] = useState("てつや");
  const [title, setTitle] = useState("");

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

  const postSns = async (): Promise<void> => {
    if (!selectedMember || !youtubeUrl || !title || !image1 || !screenshot) {
      console.error("必須項目が入力されていません");
      return;
    }
    const formData = new FormData();
    formData.append("image1", image1);
    formData.append("screenshot", screenshot);
    formData.append("member", selectedMember);
    formData.append("youtubeUrl", youtubeUrl);
    formData.append("title", title);
    
    try {
      const response = await postsService.postSns(formData);
      console.log(response);
    } catch (error) {
      console.error("Error posting data", error);
    }
  };
  

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen gap-6 ${memberColors[selectedMember]}`}
    >
      <div className="flex flex-row gap-6">
        <div className="flex flex-col justify-end gap-4">
          {image1 && (
            <img src={getImageUrl(image1)} alt="Image 1" className="w-72" />
          )}
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setImage1)}
            className="p-1"
          />
        </div>
        <div className="flex flex-col justify-end gap-4">
          {screenshot && (
            <img src={getImageUrl(screenshot)} alt="Image 2" className="w-72" />
          )}
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setScreenshot)}
            className="p-1"
          />
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
          <iframe
            className="bg-white"
            title="YouTube video player"
            src={getEmbedUrl(youtubeUrl)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
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
          投稿する
        </button>
      </div>
    </div>
  );
}

export default App;
