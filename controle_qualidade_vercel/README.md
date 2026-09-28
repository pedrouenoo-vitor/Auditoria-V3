# Dashboard de Controle da Qualidade — Vercel

Versão estática do dashboard industrial, convertida do Streamlit para HTML, CSS e JavaScript. Funciona no Vercel sem servidor Python, banco de dados ou dependências de produção.

## Recursos

- Upload e validação de CSV no navegador;
- Filtros por linha, produto e período;
- KPIs de produção, rejeição, PPM e taxa;
- Alerta acima de 20.000 PPM;
- Pareto de defeitos e tendência diária;
- Tabela e exportação do resultado filtrado;
- Layout responsivo para computador e celular.

## Teste local

Abra `index.html` no navegador ou execute:

```bash
npx serve .
```

## GitHub

```bash
git init
git add .
git commit -m "Dashboard de qualidade compatível com Vercel"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/controle-qualidade-vercel.git
git push -u origin main
```

## Vercel

1. Acesse https://vercel.com e entre com GitHub.
2. Clique em **Add New → Project**.
3. Importe o repositório.
4. Em **Framework Preset**, escolha **Other**.
5. Não informe Build Command.
6. Em Output Directory, use `.` ou deixe vazio.
7. Clique em **Deploy**.

O processamento do CSV ocorre apenas no navegador. Nenhum dado enviado pelo usuário é armazenado em servidor.

