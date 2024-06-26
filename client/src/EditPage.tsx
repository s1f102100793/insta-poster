import { useState } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { GenericSelect } from "./components/GenericSelect";
import { Button } from "./components/Button";
import { match } from "ts-pattern";
import { postsService } from "./shared/posts.service";
import { useNavigate } from "react-router-dom";

export type EditImageType = "resizeForInstagram" | "createMockIphone";

function EditPage() {
  const navigate = useNavigate();
  const [testImage, setTestImage] = useState<File | null>(null);
  const [editImageType, setEditImageType] = useState<EditImageType | null>(
    null,
  );
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const editImage = () => {
    match({ editImageType, testImage })
      .with({ editImageType: null }, () => {
        alert("画像の形状を選択してください");
        console.error("画像の形状を選択してください");
      })
      .with({ testImage: null }, () => {
        alert("画像を選択してください");
        console.error("画像を選択してください");
      })
      .otherwise(async () => {
        const formData = new FormData();
        formData.append("image", testImage as File);
        formData.append("editImageType", editImageType as string);
        const response = await postsService.editImage(formData);
        const result = await response.text();

        setImageSrc(result);
      });
  };

  const downloadImage = () => {
    if (imageSrc) {
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);

      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "processed_image.jpg";
        link.click();
      } else {
        // 他のブラウザ用の処理
        const link = document.createElement("a");
        link.href = url;
        link.download = "processed_image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };

  const navigateToHomePage = () => {
    navigate("/");
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center min-h-screen gap-6">
      <div
        className="flex flex-row padding w-72 pr-3"
        style={{ width: "19rem" }}
      >
        <Button
          color="bg-purple-500"
          text="投稿ページへ"
          onClick={navigateToHomePage}
        />
      </div>
      <div className="flex flex-row padding pr-3 gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row gap-6 border-2 border-white p-3 padding h-[400px]">
            <ImageUpload
              image={testImage}
              setImage={setTestImage}
              label="編集する画像"
              id="testImage"
            />
          </div>
          <div className="flex flex-col items-center gap-6 pr-3 pl-3">
            <GenericSelect<EditImageType>
              value={editImageType}
              options={[
                { value: "resizeForInstagram", label: "Instagram用にリサイズ" },
                { value: "createMockIphone", label: "Iphoneのモックを作成" },
              ]}
              onChange={setEditImageType}
              placeholder="画像の形状を選択してください"
            />
            <Button
              color="bg-green-500"
              text="画像を編集"
              onClick={editImage}
            />
          </div>
        </div>
        {imageSrc && (
          <div className="flex flex-col gap-6 h-[400px] p-3 border-2 border-white">
            <img
              src={imageSrc}
              alt="Processed Image"
              className="max-h-full w-auto object-contain"
            />
            <Button
              color="bg-blue-500"
              text="画像をダウンロード"
              onClick={downloadImage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditPage;
