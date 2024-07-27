import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import { grabConversationHistory, grabConversationHistoryCount } from "../models/api";
import { grabStatus, resetConversation, grabMicStatus, toggleMic } from "../models/api";
import Divider from '@mui/material/Divider';
import ChatBubbles from "../components/ChatBubbles";
import SendMessage from "../components/SendMessage";
import StatusBar from "../components/StatusBar";
// import startMicrophoneStream from "../models/websocket";
import { FaUndo, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'


export default function HomeScreen() {

    // startMicrophoneStream()

    const [bootStatus, setBootStatus] = useState("on");

    const [histCount, setCount] = useState(0)

    const [reset, setReset] = useState(false)

    const [conversation, setConversation] = useState({
        messages: [
          { sender: 'Ditto', text: "Hi! I'm Ditto." }
        ],
        is_typing: false
      })

    const [microphoneStatus, setMicrophoneStatus] = useState("off")

    let buttonSize = 25

    const handleMicPress = async () => {
        console.log('handling mic press...')
        await toggleMic()
        setMicrophoneStatus(!microphoneStatus)
    }

    const bottomRef = useRef(null);


    const resetConversationHandler = async () => {
        console.log('Resetting conversation history...')
        await resetConversation()
        setReset(true)
    }


    /**
     * Gets local electron-store cached conversation history.
     * @returns {prompts, responses} prompts and responses objects 
     */
    const getSavedConversation = () => {
        let prompts = JSON.parse(localStorage.getItem('prompts'))
        let responses = JSON.parse(localStorage.getItem('responses'))
        return { prompts, responses }
    }

    /**
     * Save updated history locally.
     */
    const handleSaveConversation = (hist) => {
        localStorage.setItem('prompts', JSON.stringify(hist.prompts));
        localStorage.setItem('responses', JSON.stringify(hist.responses));
    }

    /**
     * Creates renderable conversation history that updates the sate.
     * @param {*} hist conversation history response from API
     * @param save boolean to save locally or not
     */
    const createConversation = async (hist, save) => {
        try {
            if (save) { handleSaveConversation(hist) }
            let prompts = hist.prompts
            let responses = hist.responses
            let newConversation = {
                messages: [
                { sender: 'Ditto', text: "Hi! I'm Ditto." },
                ],
                is_typing: false
            }
            if (reset) {
                setCount(0)
                setConversation(newConversation)
                setReset(false)
                return
            }
            for (var key in prompts) {
                let prompt = prompts[key][0]
                let response = responses[key][0]
                newConversation.messages.push({ sender: 'User', text: prompt })
                newConversation.messages.push({ sender: 'Ditto', text: response })
                // if response has "Quantum mechanics" in it, console.log it
                if (response.includes("Quantum mechanics")) {
                    console.log(response)
                }
            }
            setConversation(newConversation)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {

        const handleStatus = async () => {
            var statusDb = await grabStatus()
            // console.log(statusDb.status)
            if (bootStatus !== statusDb.status) {
                setBootStatus(statusDb.status)
            }
        }

        const handleMicStatus = async () => {
            var micStatusDb = await grabMicStatus()
            // console.log(micStatusDb.ditto_mic_status)
            if (microphoneStatus !== micStatusDb.ditto_mic_status) {
                setMicrophoneStatus(micStatusDb.ditto_mic_status)
            }
        }

        const syncConversationHist = async () => {
            let hasHistCount = localStorage.getItem('histCount') === null ? false : true
            let serverHistCount = await grabConversationHistoryCount()
            let localHistCount = localStorage.getItem('histCount')
            if (hasHistCount) { // If there is a local histCount variable, check if need to update from Server
                // console.log(serverHistCount, localHistCount)
                let localHist = getSavedConversation()
                if (histCount !== localHistCount) {
                    setCount(localHistCount)
                }
                // console.log(localHist)
                createConversation(localHist, false)
            }
            if (serverHistCount !== undefined && serverHistCount !== localHistCount) {
                try {
                    let hist = await grabConversationHistory()
                    if (histCount !== serverHistCount) {
                        setCount(serverHistCount)
                    }
                    createConversation(hist, true)
                    localStorage.setItem('histCount', serverHistCount) // store histCount locally
                    // console.log(serverHistCount, histCount)
                } catch (e) {
                    console.log(e)
                }
            }
        }

        const syncInterval = setInterval(async () => {

            try {
                await handleStatus()
                await handleMicStatus()
                await syncConversationHist()
            } catch (e) {
                console.log(e)
            }

        }, 1000)

        // run when unmounted
        return () => clearInterval(syncInterval) // fixes memory leak 

    }, [reset, bootStatus, microphoneStatus])

    const statusColor = bootStatus === 'on' ? 'green' : 'red'

    // useEffect(() => {
    //     // 👇️ scroll to bottom every time messages change
    //     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    // }, [histCount]);


    return (
        <div className='App'>
            <header className='App-header'>

                {microphoneStatus === 'on' ? (
                    <FaMicrophone
                        style={{
                            paddingLeft: 20,
                            color: 'green',
                            width: buttonSize,
                            height: buttonSize
                        }}
                        onClick={async () => { await handleMicPress() }}
                    />
                ) :
                    <FaMicrophoneSlash
                        style={{
                            paddingLeft: 20,
                            color: 'red',
                            width: buttonSize,
                            height: buttonSize
                        }}
                        onClick={async () => { await handleMicPress() }}
                    />
                }
                <h2>Ditto Dashboard</h2>
                <FaUndo
                    style={{
                        "paddingRight": 20,
                        width: buttonSize,
                        height: buttonSize,
                        color: 'white'
                    }}
                    onClick={async () => { await resetConversationHandler() }}
                />
            </header>
            <Divider />
            <StatusBar
                status={bootStatus}
                statusColor={statusColor}
            />
            <Divider />
            <div className='App-body'>
                <ChatBubbles conversation={conversation} histCount={histCount} />
                <div ref={bottomRef} />
            </div>

            <footer className='App-footer'>
                <SendMessage />
            </footer>

        </div>
    );
}
