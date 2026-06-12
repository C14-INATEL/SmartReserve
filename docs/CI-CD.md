# SmartReserve - Pipeline CI/CD

## Ferramenta utilizada

Jenkins

## Objetivo

Automatizar a validação do projeto a cada atualização do repositório, garantindo que dependências sejam instaladas corretamente, testes sejam executados e o frontend seja compilado sem erros.

---

## Fluxo da Pipeline

1. Checkout SCM
   - Obtém a versão mais recente do código a partir do GitHub.

2. Backend - Instalar Dependências
   - Executa `npm install` no backend.

3. Backend - Rodar Testes
   - Executa os testes automatizados utilizando Jest.

4. Frontend - Instalar Dependências
   - Executa `npm install` no frontend.

5. Frontend - Build
   - Executa `npm run build` para validar a compilação da aplicação.

6. Post Actions
   - Finaliza a execução da pipeline e registra o resultado.

---

## Tecnologias Utilizadas

- Jenkins
- Node.js
- NPM
- Jest
- React
- Express

---

## Resultado

A pipeline garante que:

- Dependências sejam instaladas corretamente;
- Testes automatizados sejam executados;
- O frontend seja compilado com sucesso;
- Erros sejam detectados antes da integração de novas alterações.

---

## Evidência da Execução

A Figura 1 apresenta uma execução bem-sucedida da pipeline Jenkins.

![Pipeline Jenkins](images/jenkins-pipeline-success.png)