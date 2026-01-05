# Guia de Deploy (Vercel + Render)

Este projeto foi preparado para ser hospedado facilmente no **Vercel (Frontend)** e **Render (Backend)**.

## 1. Backend no Render

O Backend será hospedado no Render, que é uma plataforma gratuita e fácil para Node.js.

1. Acesse [render.com](https://render.com) e crie uma conta.
2. Clique em **"New +"** e selecione **"Web Service"**.
3. Conecte sua conta do GitHub e selecione o repositório `afonsoDomingos/escoladeia`.
4. Preencha os campos:
   - **Name:** `escoladeia-backend` (ou o que preferir)
   - **Root Directory:** `backend` (🛑 Muito importante!)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Role para baixo até a seção **"Environment Variables"** e adicione as seguintes variáveis (copie do seu arquivo local):
   - `MONGO_URI`: (Sua conexão do MongoDB Atlas)
   - `CLOUDINARY_CLOUD_NAME`: (Seu Cloud Name)
   - `CLOUDINARY_API_KEY`: (Sua API Key)
   - `CLOUDINARY_API_SECRET`: (Seu API Secret)
   - `PORT`: `3000` (Ou deixe o padrão do Render, que é 10000, o código ajusta automaticamente)
6. Clique em **"Create Web Service"**.
7. Aguarde o deploy finalizar. O Render vai gerar uma URL para o seu backend (ex: `https://escoladeia-backend.onrender.com`). **Copie essa URL.**

## 2. Frontend no Vercel

O Frontend será hospedado no Vercel.

1. Acesse [vercel.com](https://vercel.com) e crie uma conta.
2. Clique em **"Add New..."** -> **"Project"**.
3. Importe o repositório `afonsoDomingos/escoladeia`.
4. Configure o projeto:
   - **Root Directory:** Clique em **Edit** e selecione a pasta `frontend`.
   - **Build Command:** Deixe o padrão (`vite build` ou `npm run build`).
   - **Output Directory:** Deixe o padrão (`dist`).
5. Na seção **"Environment Variables"**, adicione:
   - **Name:** `VITE_API_URL`
   - **Value:** (Cole a URL do Backend que você criou no Render, SEM a barra no final. Ex: `https://escoladeia-backend.onrender.com`)
6. Clique em **"Deploy"**.

## 3. Conclusão

Pronto!
- Seu **Frontend** estará rodando em uma URL da Vercel (ex: `https://escoladeia.vercel.app`).
- Ele estará conectado automaticamente ao seu **Backend** no Render.
- Os uploads de arquivos continuarão indo para o **Cloudinary**.
- O banco de dados continua sendo o **MongoDB Atlas**.
