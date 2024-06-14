import { useState } from "react";
import { MemberName } from "./types/member";
import { TagPosition } from "./types/tagPositions";
import { ImageUpload } from "./components/ImageUpload";
import { GenericSelect } from "./components/GenericSelect";
import { Button } from "./components/Button";
import { match } from "ts-pattern";
import { postsService } from "./shared/posts.service";

export interface Member {
  memberName: MemberName | "";
  tagPosition: TagPosition | "";
}

type EditImageForm = "rectangle" | "square";

function EditPage() {
  const [testImage, setTestImage] = useState<File | null>(null);
  const [editImageForm, setEditImageForm] = useState<EditImageForm | null>(
    null,
  );
  const editImage = () => {
    match({ editImageForm, testImage })
      .with({ editImageForm: null }, () => {
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
        formData.append("editImageForm", editImageForm as string);
        console.log("formData", formData);
        await postsService.editImage(formData);
      });
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="flex flex-row gap-6 border-2 border-white p-3 padding h-[400px]">
        <ImageUpload
          image={testImage}
          setImage={setTestImage}
          label="編集する画像"
          id="testImage"
        />
      </div>
      <div className="flex flex-col items-center gap-6">
        <GenericSelect<EditImageForm>
          value={editImageForm}
          options={[
            { value: "square", label: "正方形" },
            { value: "rectangle", label: "長方形" },
          ]}
          onChange={setEditImageForm}
          placeholder="編集する画像の形状を選択"
        />
        <Button color="bg-green-500" text="画像を編集" onClick={editImage} />
      </div>
    </div>
  );
}

export default EditPage;
