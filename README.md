# cgpt 

## selfhosted chatgpt like service using openai apis (with APIs + Frontend and Session Storage) 

### this project uses the official "gpt-3.5-turbo" model API from OpenAI.


#### tech stack 
 
- Next.js (APIs and Frontend)
- OpenAI JS Lib (API calls to OpenAI)
- Mongo DB (Storing Chat History)



## Getting Started

Update docker-compose.yml/.env file with OPEN AI API Key.

Run the Frontend + API server and run Mongo DB Docker containers -


```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Screenshots -

![image](https://user-images.githubusercontent.com/8670239/216851178-c3c56d2a-a565-4899-af41-ae7caac2739a.png)

![image](https://user-images.githubusercontent.com/8670239/216851163-013271b0-2aae-4d17-89ec-f4b678f9d867.png)

## A super Simple Login System - to separate Conversation History by Username

![image](https://user-images.githubusercontent.com/8670239/217333449-2b25702d-2491-482f-aa1e-9bedd42a2bba.png)
