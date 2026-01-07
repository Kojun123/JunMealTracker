import {useState} from "react";

export default function Login({onSuccess}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const submit = async() => {
    setError(null);
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({email, password}),
      credentials: "include",
    });

        if(res.status === 200) {
      onSuccess();
    } else {
      setError("Login Failed");
    }

  };


  return (
  <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h2>로그인</h2>

      <input
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      {error && <div style={{ color: "red" }}>{error}</div>}

      <button onClick={submit}>로그인</button>
    </div>
  );
}
