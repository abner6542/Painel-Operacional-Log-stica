# 📦 Painel Operacional Logístico

Um painel de controle visual (Dashboard) desenvolvido para operações de armazém e logística. O sistema substitui quadros brancos tradicionais e planilhas estáticas, oferecendo visualização em tempo real, edição intuitiva e sincronização na nuvem via Google Sheets.

![Painel Preview](https://imgur.com/r0Kg9ov.png)
*(Substitua ou mantenha a imagem acima como capa)*

---

## 🚀 Funcionalidades

-   **Monitoramento de Outbound:** Acompanhamento de pedidos por praça, horário e status (Separando, Separado, Romaneio, Carregado).
-   **Monitoramento de Inbound:** Controle de descargas e recebimentos.
-   **Metas e Shipments:** Barras de progresso visuais para acompanhamento de metas de expedição/estoque.
-   **Edição "In-Place":** Clique duas vezes em qualquer texto ou número para editar instantaneamente.
-   **Modo TV:** Interface otimizada para grandes telas, com fontes legíveis e alto contraste.
-   **Sincronização Híbrida:**
    -   **Offline-First:** Os dados são salvos no navegador instantaneamente.
    -   **Cloud Sync:** Sincronização automática com **Google Sheets** para atualizar múltiplas telas simultaneamente.
-   **Sistema de Cores KN:** Paleta de cores profissional e consistente.

## 🛠️ Tecnologias Utilizadas

-   **Frontend:** React 19
-   **Estilização:** Tailwind CSS
-   **Ícones:** Lucide React
-   **Backend / Banco de Dados:** Google Apps Script + Google Sheets (API Gratuita)

---

## ⚙️ Instalação e Execução Local

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/painel-logistica.git
    ```

2.  Entre na pasta do projeto:
    ```bash
    cd painel-logistica
    ```

3.  Instale as dependências:
    ```bash
    npm install
    ```

4.  Rode o projeto:
    ```bash
    npm run dev
    ```

---

## ☁️ Configuração da Integração (Google Sheets)

Para que a sincronização entre diferentes telas funcione, você precisa configurar o script no Google Sheets. É gratuito e rápido.

1.  Crie uma nova planilha em branco no [Google Sheets](https://sheets.new).
2.  Vá no menu **Extensões** > **Apps Script**.
3.  Apague todo o código existente e cole o código abaixo:

```javascript
function doGet(e) {
  var props = PropertiesService.getScriptProperties();
  var data = props.getProperty('DATA_JSON');
  
  if (!data) {
    return ContentService.createTextOutput(JSON.stringify({}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(data)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var jsonData = e.postData.contents;
  var parsedData = JSON.parse(jsonData);
  
  var props = PropertiesService.getScriptProperties();
  props.setProperty('DATA_JSON', jsonData);
  
  saveToSheet(parsedData); // Opcional: Cria backup visível
  
  return ContentService.createTextOutput("Sucesso");
}

function saveToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Backup');
  if (!sheet) { sheet = ss.insertSheet('Backup'); }
  sheet.getRange('A1').setValue(JSON.stringify(data));
  sheet.getRange('A2').setValue("Última atualização: " + new Date());
}
```

4.  Clique em **Implantar** (Deploy) > **Nova implantação**.
5.  Clique na engrenagem ⚙️ > **App da Web**.
6.  Configure:
    *   **Descrição:** Painel API
    *   **Executar como:** *Eu*
    *   **Quem pode acessar:** *Qualquer pessoa* (Necessário para funcionar sem login na TV).
7.  Copie a **URL do App da Web** gerada.
8.  No Painel (aplicação rodando), clique na engrenagem ⚙️ no canto superior direito e cole a URL.

---

## 🎨 Personalização

As cores do projeto estão definidas no `tailwind.config.js` (ou na configuração inline no `index.html`):

-   `kn-darkBlue`: #003369
-   `kn-lightBlue`: #0099DA
-   `kn-green`: #08C792
-   `kn-red`: #ED2939

## 📝 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar e modificar.