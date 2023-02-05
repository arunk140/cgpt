import Head from 'next/head'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PlusCircle } from 'react-feather';

export default function Home() {

  const startNewChatTitle = "Type a Message and Submit to Start a New Conversation";

  const [historyListLoaded, setHistoryListLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [historyList, setHistoryList] = useState([] as any[]);
  const [msg, setMsg] = useState("");
  const [sessionTitle, setSessionTitle] = useState(startNewChatTitle);

  const [conversation, setConversation] = useState([] as any[]);

  const [sessionId, setSessionId] = useState(null as null|string);

  const loadHistoryList = async () => {
    var hs = await fetch('/api/history');
    var h = await hs.json();
    setHistoryList([...h, {_id: null}]);
    setHistoryListLoaded(true);
  };

  const loadHistoryBySessionId = async (id: string, title: string) => {
    if (id === sessionId) return;
    if (id === null) {
      setConversation([]);
      setSessionId(null);
      setSessionTitle(startNewChatTitle);
      return;
    }
    setIsLoading(true)
    var cv = await fetch('/api/history/' + id);
    var c = await cv.json();
    setConversation(c.history);
    setIsLoading(false);
    setSessionId(id);
    setSessionTitle(title);
  };

  const postMessage = async (message: string) => {
    setIsLoading(true);
    setMsg("");
    var url = sessionId ? '/api/chat/' + sessionId : '/api/chat';
    var msg = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({message: message})
    });
    var m = await msg.json();
    if (!sessionId) {
      setHistoryList([{_id: m.sessionId, title: m.title}, ...historyList]);
      setSessionId(m.sessionId);
      setSessionTitle(m.title);
    }
    setConversation([...conversation, {
      input: message,
      output: m.response,
      timestamp: new Date().getTime()
    }]);
    setIsLoading(false);
  };

  const handleKeyUp = (e: any) => {
    if (e.key === 'Enter' && e.shiftKey) {
      postMessage(msg);
    }
  };

  function formatDate(timestamp: number) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    var hour = date.getHours().toString().padStart(2, '0');
    var minute = date.getMinutes().toString().padStart(2, '0');
  
    return day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
  }

  useEffect(() => {
    loadHistoryList();
  }, []);
  return (
    <>
      <Head>
        <title>cgpt</title>
        <meta name="description" content="cgpt" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="parent bg-slate-600 h-screen grid grid-cols-8">
        <section className="sidebar bg-slate-800 md:col-span-1 hidden sm:inline-flex flex-col h-screen">
          <div className=" text-2xl text-white p-4">
            {"History"}
          </div>
          {historyListLoaded ? <div className='grow overflow-auto'>
            {historyListLoaded && historyList.map((h: {_id: string, title: string}) => {
              return (
                <div key={h._id}>
                  {h._id === null ? <hr className='w-[80%] opacity-30 my-5 mx-auto' /> : null}
                  <div className="text-gray-300 cursor-pointer p-3">
                    <div className={(h._id === sessionId ? "bg-slate-700 rounded-lg" : "") + " flex p-2"} onClick={()=>{loadHistoryBySessionId(h._id, h.title)}} data-value={h._id} data-title={h.title}>
                      {h._id === null ? <PlusCircle size={20} className="inline-block mr-2" /> : null}
                      {h._id ? h.title : "New Conversation"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div> : <div className="text-gray-200">Loading...</div>}
        </section>
        <main className="main md:col-span-7 col-span-8 container mx-auto flex items-end flex-col h-screen">
          <h1 className='w-full text-gray-200 float-left text-xl p-4'>{sessionTitle}</h1>
          <div className="flex-grow w-full overflow-auto">
            {conversation.map((c: any) => {
              return (
                <div key={c.timestamp}>
                  <div className="bg-slate-700 p-4 rounded-lg m-1">
                    <div className="text-gray-200" style={{whiteSpace:'pre-wrap'}}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.input.trim()}</ReactMarkdown>
                    </div>
                    <div className="text-gray-400 text-xs">
                    {formatDate(c.timestamp)}
                    </div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg m-1">
                    <div className="text-gray-200" style={{whiteSpace:'pre-wrap'}}>
                      <ReactMarkdown components={{
                        a: ({node, ...props}) => <a className="text-blue-400" {...props} />,
                        pre: ({node, ...props}) => <pre className="font-mono bg-slate-900 rounded-lg p-2 my-2" {...props} />,
                        code: ({node, ...props}) => <code className="font-mono italic" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-disc pl-5" {...props} />
                      }} remarkPlugins={[remarkGfm]}>
                        {c.output.trim()}
                      </ReactMarkdown>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatDate(c.timestamp)}
                    </div>
                  </div>
                </div>
              );  
            })}
            {isLoading && <div className="text-gray-200">Loading...</div>}
          </div>
          <div className='w-full flex'>
            <textarea disabled={isLoading} value={msg} onChange={(e)=>{setMsg(e.target.value)}} placeholder={"Shift + Enter to Submit, Enter for New Line"} onKeyUp={handleKeyUp} className="h-20 w-full resize-none p-2 rounded-lg mb-1"></textarea>
            <button disabled={isLoading} className=' bg-slate-800 rounded-lg p-3 h-20 ml-2 text-gray-300' onClick={()=>postMessage(msg)}>Submit</button>
          </div>
        </main>
      </div>
    </>
  )
}
