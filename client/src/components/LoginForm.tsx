import { useState } from "react";
import { TextInput } from "./TextInput";
import { Button } from "./Button";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="flex flex-col border-white border-2 px-8 pt-6 pb-8 mb-4 w-72 gap-6">
        <label>
          Username:
          <TextInput value={username} setValue={setUsername} />
        </label>
        <label>
          Password:
          <TextInput value={password} setValue={setPassword} type="password" />
        </label>
        <Button
          color="bg-blue-500"
          text="Login"
          onClick={() => onLogin(username, password)}
        />
      </div>
    </div>
  );
}

export default LoginForm;
