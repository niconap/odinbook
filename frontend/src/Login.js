import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  let navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  let handleSubmit = async (e) => {
    e.preventDefault();
    console.log(username, password);
    try {
      let res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      let resJson = await res.json();
      if (resJson.token) {
        setUsername('');
        setPassword('');
        localStorage.setItem('token', resJson.token);
        navigate('../', { replace: true });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="login">
      <form onSubmit={handleSubmit} method="get" name="login">
        <input
          type="text"
          value={username}
          name="username"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          value={password}
          name="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" value="Log in" />
      </form>
      <p>
        Don't have an account? Sign up <a href="signup">here</a>
      </p>
    </div>
  );
}

export default Login;
