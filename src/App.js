import './App.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp, collection, query, orderBy, addDoc, limit } from 'firebase/firestore';

import { useRef, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Input, Button, Container, VStack, Heading, Text, Highlight, useToast, Flex, Divider, SlideFade } from '@chakra-ui/react'
import { UnlockIcon, ChatIcon } from '@chakra-ui/icons'

import { v4 as uuidv4 } from 'uuid';
import { randomColor } from 'randomcolor';

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
  const [tempUUID] = useState(uuidv4());
  const [logStatus, setLogStatus] = useState(false);
  const [color] = useState(randomColor({ luminosity: 'light', seed: tempUUID }));

  return (
    <div className="App">
      {logStatus ? <ChatRoom tempUUID={tempUUID} color={color} setLogStatus={setLogStatus} nickname={nickname} /> : <LogIn color={color} setLogStatus={setLogStatus} nickname={nickname} setNickname={setNickname} />}
    </div>
  );
}

function LogIn(props) {
  const toast = useToast();

  const logInAnonymously = () => {
    if (props.nickname.length === 0) {
      toast({
        title: 'Please enter a nickname',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    } else if (props.nickname.length < 4) {
      toast({
        title: 'Your nickname should have atleast 4 characters',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    } else {
      props.setLogStatus(true);
      toast({
        title: 'Logged in successfully',
        description: 'I know you\'re there, I just don\'t know who you are!',
        status: 'success',
        duration: 3000,
        variant: 'subtle',
        position: 'top',
        isClosable: true,
      })
    }
  }
  return (
    <VStack spacing='1rem' width={"100svw"} height={"90svh"} alignContent={"center"} justifyContent={"center"}>
      <Container centerContent>
        <Heading size='lg'>
          <Highlight
            query={['nickname']}
            styles={{ px: '3', py: '1', rounded: 'full', bg: props.color }}
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
          maxLength='23'
          isRequired={true}
          focusBorderColor={props.color}
        />
      </Container>
      <Container centerContent>
        <Button size='lg' rightIcon={<UnlockIcon />} onClick={logInAnonymously}>Log in</Button>
      </Container>
    </VStack>
  )
}

function ChatRoom(props) {

  const scroll = useRef();

  const q = query(
    messagesRef,
    orderBy("timestamp", "desc"),
    limit(50)
  );

  const [messages] = useCollectionData(q);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {

    setLoading(true);

    if (e && e.cancelable) {
      e.preventDefault();
    }

    await addDoc(messagesRef, {
      nickname: props.nickname,
      uuid: props.tempUUID,
      timestamp: serverTimestamp(),
      message: message
    }).then(() => setLoading(false));
    setMessage('');
    scroll.current.scrollIntoView({
      behavior: "smooth"
    });
  }

  return (
    <VStack maxW='50rem' m='auto' spacing='0rem' width={"100svw"} height={"100svh"}>
      <Container className='hidden-scroll' overflowY='scroll' maxW='43rem' height='100%' flexDirection='column-reverse' alignItems='flex-start' centerContent>
        <span style={{ paddingBottom: '1.1rem' }} ref={scroll}></span>
        {messages && messages.map(m => m && <ChatMessage key={m.timestamp} tempUUID={props.tempUUID} m={m} />)}
      </Container>
      <Divider />
      <Container m='1rem' centerContent>
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          variant='filled'
          placeholder='type something nice...'
          size='lg'
          isRequired={true}
          focusBorderColor={props.color}
          onKeyDown={(e) => { if (message && e.key === "Enter") sendMessage(); }}
        />
      </Container>
      <Container mb='0rem' flexDirection='column' justifyContent='center' centerContent>
        <Button variant='ghost' bg={props.color} isLoading={loading} size='lg' rightIcon={<ChatIcon />} isDisabled={!message} onClick={sendMessage}>Send</Button>
        <Button variant='ghost' mt='1rem' mb='1rem' size='sm' onClick={() => props.setLogStatus(false)}>Change name</Button>
      </Container>
    </VStack>
  )
}

function ChatMessage(props) {
  const { message, nickname, timestamp, uuid } = props.m;

  const msgCss = uuid === props.tempUUID ? 'send' : 'receive';
  const margin = uuid === props.tempUUID ? 'sendM' : 'receiveM';

  return (
    <SlideFade className={margin} offsetY='80px' in={timestamp}>
      <Flex className={msgCss} mt='1rem' bg={randomColor({ luminosity: 'light', seed: uuid })} border='2px solid transparent' flexDirection='column-reverse' alignItems='center'>
        <Flex width='100%' justifyContent='flex-end' flexDirection='column' alignItems='flex-end' pr='1rem' pl='1.5rem'>
          <Heading as='h6' size='xs' p='0.375rem' overflowWrap='anywhere'>
            {nickname}
          </Heading>
          <Heading as='h6' size='xs' fontStyle='italic' fontWeight='400' p='0.375rem'>
            {(timestamp && timestamp.toDate().toDateString() === new Date().toDateString()) ? "Today, " + timestamp.toDate().toLocaleString('en-US', { timeStyle: 'short' }) : timestamp && timestamp.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </Heading>
        </Flex>
        <Text fontSize='lg' width='100%' p='0.5rem' pl='1rem' align='left' overflowWrap='anywhere'>{message}</Text>
      </Flex>
    </SlideFade>
  )
}

export default App;