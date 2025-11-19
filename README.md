# 📦 Painel Operacional Logístico

Desenvolvido para otimizar a gestão visual em operações de armazém, este painel substitui controles manuais por uma interface digital reativa, focada em grandes telas (TVs) e facilidade de uso.

<img width="1919" height="905" alt="image" src="https://github.com/user-attachments/assets/d3574c81-1ba4-4929-bad7-5d275989f084" />

## 🚀 Funcionalidades Principais

*   **Gestão Visual em Tempo Real:** Monitoramento claro de fluxos de Inbound e Outbound com indicadores de status coloridos.
*   **Sincronização Híbrida:** Integração "Serverless" utilizando Google Sheets como backend, permitindo atualizações remotas.
*   **Interface "Click-to-Edit":** Edição intuitiva de qualquer dado na tela com duplo clique, sem necessidade de formulários complexos.
*   **Design Responsivo & Modo TV:** Layout adaptável que prioriza legibilidade, contraste e hierarquia visual em grandes monitores.
*   **Resiliência de Dados:** Sistema robusto com cache local (LocalStorage) e recuperação automática de falhas.

---

## 🛠️ Tecnologias & Arquitetura

Este projeto utiliza uma stack moderna para garantir performance e baixo custo de manutenção, eliminando a necessidade de servidores dedicados.

### Frontend (Interface)
*   **React 19:** Core da aplicação, garantindo uma interface fluida e reativa.
*   **Tailwind CSS:** Framework de estilização para manter a identidade visual corporativa (Cores KN) e responsividade.
*   **TypeScript:** Garante a segurança do código e previne erros de dados em tempo de execução.
*   **Lucide React:** Biblioteca de ícones leves e modernos.

### Backend & Integração (Processo)
*   **Google Apps Script (API):** Atua como um "API Gateway" gratuito, recebendo as requisições do painel.
*   **Google Sheets (Database):** Funciona como banco de dados na nuvem. Permite que a gestão acompanhe o histórico ou altere dados via celular/planilha que refletem na TV da operação.
*   **JSON Polling:** O painel verifica periodicamente alterações na nuvem para manter todas as telas sincronizadas.

---

## 👨‍💻 Autor & Desenvolvimento

Projeto desenvolvido com foco em excelência operacional, UX e tecnologias web modernas.

<div align="left">
  <a href="https://www.linkedin.com/in/abner-soares/" target="_blank">
    <img src="https://img.shields.io/badge/Desenvolvido_por-Abner_Soares-003369?style=for-the-badge&logo=linkedin&logoColor=white" alt="Abner Soares LinkedIn" />
  </a>
</div>

---
*© 2025 Painel Operacional Logístico - Todos os direitos reservados.*
