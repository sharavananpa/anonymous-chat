import './App.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp, collection, query, orderBy, addDoc, limit } from 'firebase/firestore';

import { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5q8rBhMM2Q0BIi0eNahxJSVLN_I9J2kk",
  authDomain: "anonymous-chat-818e1.firebaseapp.com",
  projectId: "anonymous-chat-818e1",
  storageBucket: "anonymous-chat-818e1.appspot.com",
  messagingSenderId: "666673735696",
  appId: "1:666673735696:web:3676267adc1ff212414295"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

function App() {
  const [nickname, setNickname] = useState('');
  const [logStatus, setLogStatus] = useState(false);

  return (
    <div className="App">
      <header>
        <h1>🔥</h1>
        {logStatus ? <LogOut setLogStatus={setLogStatus} /> : <p>Enter a nickname to continue...</p>}

      </header>
      <section>
        {logStatus ? <ChatRoom setLogStatus={setLogStatus} nickname={nickname} /> : <LogIn setLogStatus={setLogStatus} nickname={nickname} setNickname={setNickname} />}
      </section>
    </div>
  );
}

function LogIn(props) {
  const logInAnonymously = () => {
    props.setLogStatus(true);
  }
  return (
    <>
      <label>Enter a nickname</label>
      <br />
      <input value={props.nickname} onChange={e => props.setNickname(e.target.value)} />
      <br />
      <button onClick={logInAnonymously}>Log in</button>
    </>
  )
}

function LogOut(props) {
  return (
    <button onClick={() => props.setLogStatus(false)}>Log out</button>
  )
}

function ChatRoom(props) {


  const q = query(
    messagesRef,
    orderBy("timestamp", "desc"),
    limit(50)
  );

  const [messages] = useCollectionData(q);

  const [message, setMessage] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    await addDoc(messagesRef, {
      nickname: props.nickname,
      timestamp: serverTimestamp(),
      message: message
    });

    setMessage('');
  }

  return (
    <>
      {messages && messages.map(m => <ChatMessage key={m.timestamp} m={m} />)}

      <form onSubmit={sendMessage}>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="say something nice" />
        <button type="submit" disabled={!message}>🕊️</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { message, nickname, timestamp } = props.m;

  const messageClass = false ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <p>{nickname} - {message} - {(timestamp && timestamp.toDate().toDateString() === new Date().toDateString()) ? "Today, " + timestamp.toDate().toLocaleString('en-US', { timeStyle: 'short' }) : timestamp && timestamp.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>
    </>
  )
}

export default App;