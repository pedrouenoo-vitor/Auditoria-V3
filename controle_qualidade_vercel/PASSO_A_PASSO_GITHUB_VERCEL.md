# Publicação no GitHub e Vercel

## 1. Testar antes de publicar

Abra a pasta e dê dois cliques em `index.html`. O dashboard deverá abrir no navegador. Teste o upload, os filtros, os gráficos e o download do CSV.

Se preferir um servidor local, instale Node.js e execute:

```powershell
npx serve .
```

Abra o endereço indicado no terminal, normalmente `http://localhost:3000`.

## 2. Criar o repositório

No GitHub, clique em **New repository**, informe `controle-qualidade-vercel`, escolha a visibilidade e não crie README automático.

## 3. Enviar pelo terminal

Abra o PowerShell dentro da pasta e execute:

```powershell
git init
git add .
git commit -m "Criar dashboard de controle da qualidade"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/controle-qualidade-vercel.git
git push -u origin main
```

Troque `SEU_USUARIO` pelo usuário real do GitHub. Autorize o login quando o navegador abrir.

## 4. Publicar no Vercel

1. Entre em `https://vercel.com` usando a conta do GitHub.
2. Clique em **Add New** e depois **Project**.
3. Localize `controle-qualidade-vercel` e clique em **Import**.
4. Use **Framework Preset: Other**.
5. Mantenha **Root Directory** como `./`.
6. Deixe **Build Command** vazio.
7. Deixe **Output Directory** vazio ou informe `.`.
8. Clique em **Deploy**.

Ao terminar, o Vercel fornecerá uma URL pública. Cada novo `git push` atualizará o site automaticamente.

## 5. Atualizar o aplicativo

Depois de modificar algum arquivo:

```powershell
git add .
git commit -m "Atualizar dashboard"
git push
```

## 6. Problemas comuns

- Página em branco: abra o Console do navegador com `F12` e confira erros no `app.js`.
- Arquivo CSV recusado: use as colunas `data,linha,produto,defeito,produzido,rejeitado`.
- Gráficos vazios: selecione ao menos uma linha e um produto nos filtros.
- Repositório não aparece no Vercel: autorize o acesso do Vercel ao repositório nas configurações do GitHub.
- Erro 404: confira se `index.html` está na raiz do repositório e se Root Directory é `./`.
- Acentuação incorreta: salve o CSV como UTF-8.

