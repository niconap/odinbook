import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  let navigate = useNavigate();
  const signup = window.location.search.split('=')[1];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  let handleSubmit = async (e) => {
    e.preventDefault();
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
        localStorage.setItem('token', `Bearer ${resJson.token}`);
        navigate('../', { replace: true });
        window.location.reload();
      } else {
        setMessage(resJson.info.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="login">
      {signup ? (
        <p>You successfully created an account, please log in to continue</p>
      ) : null}
      <form onSubmit={handleSubmit} name="login">
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
        <span id="message">{message}</span>
      </form>
      <p>
        Don't have an account? Sign up <a href="signup">here</a>
      </p>
    </div>
  );
}

export default Login;
