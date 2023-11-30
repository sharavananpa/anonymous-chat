import './App.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp, collection, query, orderBy, addDoc, limit } from 'firebase/firestore';

import { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Input, Button, Container, VStack, Heading, Highlight, useToast } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'

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
      <section>
        {logStatus ? <ChatRoom setLogStatus={setLogStatus} nickname={nickname} /> : <LogIn setLogStatus={setLogStatus} nickname={nickname} setNickname={setNickname} />}
      </section>
    </div>
  );
}

function LogIn(props) {
  const toast = useToast();

  const logInAnonymously = () => {
    if (props.nickname.length == 0 ) {
      toast({
        title: 'Please enter a nickname',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } else if(props.nickname.length < 4) {
      toast({
        title: 'Your nickname should have atleast 4 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } else {
      props.setLogStatus(true);
      toast({
        title: 'Logged in successfully',
        description: 'I know you\'re there, I just don\'t know who you are!',
        status: 'success',
        duration: 7000,
        isClosable: true,
      })
    }
  }
  return (
    <VStack spacing='1rem' width={"100vw"} height={"90vh"} alignContent={"center"} justifyContent={"center"}>
      <Container centerContent>
        <Heading size='lg'>
          <Highlight
            query={['nickname']}
            styles={{ px: '3', py: '1', rounded: 'full', bg: 'purple.200' }}
          >
            Enter a nickname
          </Highlight>
        </Heading>
      </Container>
      <Container centerContent>
        <Input
          value={props.nickname}
          onChange={e => props.setNickname(e.target.value)}
          variant='filled'
          placeholder='Kaipulla'
          size='lg'
          width='auto'
          isRequired='true'
          focusBorderColor='purple.500'
        />
      </Container>
      <Container centerContent>
        <Button colorScheme='purple' size='lg' rightIcon={<ArrowForwardIcon />} onClick={logInAnonymously}>Log in</Button>
      </Container>
    </VStack>
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
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="say something nice" />
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