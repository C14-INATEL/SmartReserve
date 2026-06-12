\# Histórias de Usuário — SmartReserve



Este documento apresenta as histórias de usuário do sistema SmartReserve, com critérios de aceitação no formato Given/When/Then, prioridade, status de entrega e rastreabilidade completa.



\---



\## US01 — Login



> \*\*Como\*\* usuário do sistema, \*\*quero\*\* realizar login com minha matrícula e senha, \*\*para\*\* acessar minhas reservas e os recursos disponíveis de forma segura.



| Atributo   | Valor   |

|------------|---------|

| Prioridade | Alta    |

| Status     | Entregue |



\### Descrição



O sistema autentica o usuário por meio de matrícula institucional e senha. Após o login bem-sucedido, os dados da sessão são persistidos no `sessionStorage` do navegador, permitindo que o usuário permaneça autenticado enquanto a aba estiver aberta. O backend realiza trim automático da matrícula, evitando falhas causadas por espaços acidentais.



\### Critérios de Aceitação



\*\*CA01 — Login com credenciais válidas\*\*

\- \*\*Given\*\* o usuário está na tela de login

\- \*\*When\*\* insere matrícula e senha corretos e clica em "Entrar"

\- \*\*Then\*\* é redirecionado para a home, com sessão ativa e nome exibido na interface



\*\*CA02 — Erro com credenciais inválidas\*\*

\- \*\*Given\*\* o usuário está na tela de login

\- \*\*When\*\* insere matrícula ou senha incorretos

\- \*\*Then\*\* o sistema exibe mensagem de erro e permanece na tela de login sem redirecionar



\*\*CA03 — Tolerância a espaços na matrícula\*\*

\- \*\*Given\*\* o usuário digita a matrícula com espaços extras (ex.: `" 180 "`)

\- \*\*When\*\* envia o formulário

\- \*\*Then\*\* o login é realizado com sucesso (backend aplica trim antes da consulta)



\*\*CA04 — Persistência de sessão\*\*

\- \*\*Given\*\* o usuário já está autenticado

\- \*\*When\*\* recarrega a página

\- \*\*Then\*\* a sessão é restaurada via `sessionStorage` e o usuário não precisa fazer login novamente



\*\*CA05 — Falha de servidor\*\*

\- \*\*Given\*\* o banco de dados está indisponível

\- \*\*When\*\* o usuário tenta fazer login

\- \*\*Then\*\* o sistema retorna status 500 com mensagem de erro apropriada



\### Rastreabilidade



| Artefato | Referência |

|----------|-----------|

| PRs | \[#1](../../pulls/1), \[#2](../../pulls/2), \[#3](../../pulls/3) — Schema de usuário com Mongoose |

| PR  | \[#12](../../pulls/12) — Integração front-back (matrícula, API, seed) |

| PR  | \[#13](../../pulls/13) — Testes unitários para autenticação |

| Teste backend | `backend/tests/authRoutes.mock.test.js` — senha inválida → 401; falha de banco → 500 |

| Teste backend | `backend/tests/routes.test.js` — login com trim na matrícula |

| Teste E2E | `frontend/tests/auth.spec.ts` — 9 cenários: exibição do formulário, credenciais válidas/inválidas, estado de carregamento, persistência de sessão, logout |



\---



\## US02 — Visualizar Recursos Disponíveis



> \*\*Como\*\* usuário autenticado, \*\*quero\*\* visualizar os recursos disponíveis (salas, laboratórios e equipamentos), \*\*para\*\* identificar opções adequadas antes de realizar uma reserva.



| Atributo   | Valor   |

|------------|---------|

| Prioridade | Alta    |

| Status     | Entregue |



\### Descrição



Após o login, o usuário acessa uma tela principal com todos os recursos cadastrados exibidos em grade. Cada card mostra nome, imagem, descrição e um badge indicando o tipo do recurso. O usuário pode filtrar por tipo (Salas, Laboratórios, Equipamentos) e realizar busca textual por nome ou descrição, podendo combinar ambos os critérios simultaneamente.



\### Critérios de Aceitação



\*\*CA01 — Listagem inicial\*\*

\- \*\*Given\*\* o usuário está autenticado

\- \*\*When\*\* acessa a tela inicial

\- \*\*Then\*\* visualiza todos os recursos em formato de grade, com nome, tipo e imagem de cada um



\*\*CA02 — Filtro por tipo\*\*

\- \*\*Given\*\* existem recursos de diferentes tipos cadastrados

\- \*\*When\*\* o usuário clica no filtro "Salas"

\- \*\*Then\*\* apenas recursos do tipo `sala` são exibidos; os demais ficam ocultos



\*\*CA03 — Busca por nome ou descrição\*\*

\- \*\*Given\*\* o usuário está na tela inicial

\- \*\*When\*\* digita um termo no campo de busca

\- \*\*Then\*\* a lista é filtrada em tempo real, exibindo apenas recursos cujo nome ou descrição contém o termo



\*\*CA04 — Combinação de filtro e busca\*\*

\- \*\*Given\*\* o filtro "Labs" está ativo e o usuário digita um termo de busca

\- \*\*When\*\* os dois critérios são aplicados simultaneamente

\- \*\*Then\*\* apenas laboratórios cujo nome ou descrição bate com o termo são exibidos



\*\*CA05 — Badge de tipo\*\*

\- \*\*Given\*\* recursos de tipos diferentes estão listados

\- \*\*Then\*\* cada card exibe um badge visual indicando seu tipo (Sala / Laboratório / Equipamento)



\### Rastreabilidade



| Artefato | Referência |

|----------|-----------|

| PR | \[#9](../../pulls/9) — Rota de listagem de recursos (Task 07) |

| PR | \[#14](../../pulls/14) — Testes iniciais do frontend |

| Teste backend | `backend/tests/routes.test.js` — criação de recurso com horários padrão |

| Teste E2E | `frontend/tests/recursos.spec.ts` — 14 cenários: grade, badges, filtros, busca, combinação filtro+busca, navegação para detalhes |

| Teste E2E | `frontend/tests/home.spec.ts` — 4 cenários: carregamento da página, exibição de recursos, botões de filtro, busca |



\---



\## US03 — Reservar Sala em Horário Livre



> \*\*Como\*\* usuário autenticado, \*\*quero\*\* reservar um recurso em um horário disponível, \*\*para\*\* garantir meu acesso exclusivo ao espaço ou equipamento no período desejado.



| Atributo   | Valor   |

|------------|---------|

| Prioridade | Alta    |

| Status     | Entregue |



\### Descrição



Na página de detalhes de um recurso, o usuário visualiza os horários disponíveis e pode criar uma reserva selecionando data e intervalo de tempo. O sistema valida todos os campos obrigatórios, normaliza o formato de hora (ex.: `9:00` → `09:00`) e verifica conflitos com reservas existentes. Horários adjacentes (ex.: 10:00–11:00 e 11:00–12:00) são permitidos sem conflito. O máximo de 4 horas por reserva é aplicado pela interface.



\### Critérios de Aceitação



\*\*CA01 — Reserva bem-sucedida\*\*

\- \*\*Given\*\* o usuário está na página de detalhes de um recurso com horário disponível

\- \*\*When\*\* seleciona data, hora de início e hora de fim e confirma

\- \*\*Then\*\* o sistema retorna status 201 e a reserva aparece em "Minhas Reservas"



\*\*CA02 — Conflito de horário\*\*

\- \*\*Given\*\* já existe uma reserva para o recurso no intervalo 14:00–16:00

\- \*\*When\*\* outro usuário tenta reservar o mesmo recurso no mesmo intervalo (ou sobreposição parcial)

\- \*\*Then\*\* o sistema retorna erro 400 com mensagem de conflito e a reserva não é criada



\*\*CA03 — Horários adjacentes permitidos\*\*

\- \*\*Given\*\* existe uma reserva para o recurso de 10:00 às 11:00

\- \*\*When\*\* um usuário tenta reservar o mesmo recurso de 11:00 às 12:00

\- \*\*Then\*\* a reserva é aceita com sucesso (sem conflito, pois os intervalos apenas se tocam)



\*\*CA04 — Validação de campos obrigatórios\*\*

\- \*\*Given\*\* o usuário envia o formulário de reserva com campos ausentes (usuário, recurso, data, hora início ou hora fim)

\- \*\*Then\*\* o sistema retorna 400 com mensagem indicando qual campo está faltando



\*\*CA05 — Normalização de formato de hora\*\*

\- \*\*Given\*\* o usuário informa hora no formato `9:00` (sem zero à esquerda)

\- \*\*When\*\* a reserva é processada

\- \*\*Then\*\* a hora é normalizada para `09:00` e a reserva é salva corretamente



\*\*CA06 — Horário inválido\*\*

\- \*\*Given\*\* o usuário informa hora de fim anterior à hora de início (ex.: início 14:00, fim 10:00)

\- \*\*Then\*\* o sistema rejeita a reserva com erro de validação



\### Rastreabilidade



| Artefato | Referência |

|----------|-----------|

| PR | \[#6](../../pulls/6) — Criação de reservas com validação (Tasks 10 e 11) |

| PR | \[#15](../../pulls/15) — Refatoração de lógica de horários e 4 testes unitários |

| Teste unitário | `backend/tests/reservationTime.test.js` — parsing de hora, formatos inválidos, detecção de sobreposição, limites diários |

| Teste backend | `backend/tests/routes.test.js` — conflito, adjacência, normalização, campos obrigatórios, horários inválidos |

| Teste backend | `backend/tests/reservationRoutes.mock.test.js` — cenários mocked de POST |

| Teste E2E | `frontend/tests/reservas.spec.ts` — 12 cenários: página de detalhes, seção de reserva rápida, slots disponíveis vs. ocupados, diálogo de reserva |



\---



\## US04 — Cancelar Reserva



> \*\*Como\*\* usuário autenticado, \*\*quero\*\* cancelar uma reserva existente, \*\*para\*\* liberar o recurso para outros usuários quando não precisar mais utilizá-lo.



| Atributo   | Valor   |

|------------|---------|

| Prioridade | Média   |

| Status     | Entregue |



\### Descrição



Na tela "Minhas Reservas", cada linha da tabela possui um botão "Cancelar". Ao confirmar o cancelamento, o sistema remove a reserva via endpoint DELETE. A tabela é atualizada imediatamente, removendo a linha sem necessidade de recarregar a página. Se a reserva não for encontrada (ex.: já cancelada por outro processo), o sistema retorna 404.



\### Critérios de Aceitação



\*\*CA01 — Cancelamento bem-sucedido\*\*

\- \*\*Given\*\* o usuário está em "Minhas Reservas" e possui ao menos uma reserva ativa

\- \*\*When\*\* clica em "Cancelar" para uma reserva

\- \*\*Then\*\* a reserva é removida do banco e a linha desaparece da tabela sem recarregar a página



\*\*CA02 — Reserva não encontrada\*\*

\- \*\*Given\*\* o ID da reserva não existe (ex.: já foi cancelada anteriormente)

\- \*\*When\*\* o DELETE é chamado com esse ID

\- \*\*Then\*\* o sistema retorna status 404 com mensagem de erro apropriada



\*\*CA03 — Liberação do horário\*\*

\- \*\*Given\*\* uma reserva foi cancelada com sucesso

\- \*\*When\*\* o usuário navega para a página de detalhes do recurso

\- \*\*Then\*\* o horário cancelado volta a aparecer como disponível para nova reserva



\### Rastreabilidade



| Artefato | Referência |

|----------|-----------|

| PR | \[#6](../../pulls/6) — Rota DELETE de reservas |

| PR | \[#13](../../pulls/13) — Testes unitários para reservas |

| Teste backend | `backend/tests/reservationRoutes.mock.test.js` — cenários mocked de DELETE (sucesso e 404) |

| Teste E2E | `frontend/tests/minhas-reservas.spec.ts` — botão cancelar, remoção de linha da tabela |



\---



\## US05 — Visualizar Minhas Reservas



> \*\*Como\*\* usuário autenticado, \*\*quero\*\* visualizar todas as minhas reservas, \*\*para\*\* acompanhar meus compromissos agendados e gerenciá-los quando necessário.



| Atributo   | Valor   |

|------------|---------|

| Prioridade | Alta    |

| Status     | Entregue |



\### Descrição



A seção "Minhas Reservas" exibe em formato de tabela todas as reservas do usuário logado, ordenadas por data (mais recente primeiro). Cada linha contém: nome do recurso, data, intervalo de horário, badge de status ("Confirmado") e botão de cancelamento. Quando não há reservas, uma mensagem de estado vazio é exibida.



\### Critérios de Aceitação



\*\*CA01 — Listagem de reservas\*\*

\- \*\*Given\*\* o usuário possui reservas ativas

\- \*\*When\*\* acessa "Minhas Reservas"

\- \*\*Then\*\* visualiza tabela com colunas: Recurso, Data, Horário, Status e Ações



\*\*CA02 — Badge de status\*\*

\- \*\*Given\*\* uma reserva está confirmada

\- \*\*Then\*\* o campo Status exibe o badge "Confirmado" com estilo visual verde



\*\*CA03 — Estado vazio\*\*

\- \*\*Given\*\* o usuário não possui nenhuma reserva

\- \*\*When\*\* acessa "Minhas Reservas"

\- \*\*Then\*\* o sistema exibe uma mensagem informando que não há reservas cadastradas



\*\*CA04 — Ordenação por data\*\*

\- \*\*Given\*\* o usuário possui múltiplas reservas em datas diferentes

\- \*\*When\*\* visualiza a lista

\- \*\*Then\*\* as reservas aparecem ordenadas da mais recente para a mais antiga



\*\*CA05 — Isolamento por usuário\*\*

\- \*\*Given\*\* múltiplos usuários possuem reservas no sistema

\- \*\*When\*\* um usuário acessa "Minhas Reservas"

\- \*\*Then\*\* apenas as reservas do usuário autenticado são exibidas (filtro por `usuario=<userId>`)



\### Rastreabilidade



| Artefato | Referência |

|----------|-----------|

| PR | \[#6](../../pulls/6) — Rota GET de reservas por usuário |

| PR | \[#12](../../pulls/12) — Integração frontend-backend |

| PR | \[#13](../../pulls/13) — Testes unitários para reservas |

| Teste backend | `backend/tests/reservationRoutes.mock.test.js` — cenários mocked de GET filtrado por usuário |

| Teste E2E | `frontend/tests/minhas-reservas.spec.ts` — 12 cenários: cabeçalhos da tabela, exibição de recurso/horário/status, botão cancelar, estado vazio, menu de perfil |



\---



\## Resumo Geral



| ID   | História                         | Prioridade | Status    |

|------|----------------------------------|------------|-----------|

| US01 | Login                            | Alta       | Entregue  |

| US02 | Visualizar recursos disponíveis  | Alta       | Entregue  |

| US03 | Reservar sala em horário livre   | Alta       | Entregue  |

| US04 | Cancelar reserva                 | Média      | Entregue  |

| US05 | Visualizar minhas reservas       | Alta       | Entregue  |

