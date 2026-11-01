# SAP ABAP | Accounts Payable Analytics

**Created by Robert Bishop an SAP certified accounting & finance student @ East Tennessee State University**
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/712b5b5f-4c7c-4703-b7a1-427171df6150" />

An SAP ABAP development project focused on building an Accounts Payable analytics application to improve financial reporting, invoice monitoring, and payment management.

The local SAPUI5 dashboard summarizes open invoices, overdue balances, aging, upcoming payments, and potential duplicates using mock data.
<img width="1884" height="1035" alt="image" src="https://github.com/user-attachments/assets/cf7c19f7-2563-4dc2-bfc1-95b1abc884fd" />

The Invoices section shows the underlying vendor invoices, due dates, amounts, and payment statuses behind those summaries.
<img width="1856" height="529" alt="image" src="https://github.com/user-attachments/assets/3c90c5ec-e37f-416e-9997-92a19ba0c73a" />

The application will use simulated financial data to demonstrate SAP development and accounting automation techniques.

## Planned Features

- **Invoice Management:** Store and manage vendor invoices using custom SAP database tables.
- **AP Aging Analysis:** Categorize outstanding invoices by overdue periods.
- **Duplicate Detection:** Identify potentially duplicate vendor invoices.
- **Cash Flow Forecasting:** Analyze upcoming payment obligations.
- **Analytics Dashboard:** Visualize financial KPIs and invoice activity using SAP Fiori.

## Tech Stack

- **SAP ABAP Cloud** — Backend development and accounting automation - For this project, I used the SAP BTP Trial Account, it's a strenous process to setup.
- **SAP HANA** — Database storage and management
- **ABAP Development Tools (Eclipse)** — Development environment
- **SAP Core Data Services (CDS)** — Data modeling and analytics (planned)
- **SAP RAP / Fiori Elements** — RESTful services and analytics dashboard (planned)
- **SAPUI5 (Horizon theme)** — Local Accounts Payable dashboard using mock invoice data
- **abapGit & GitHub** — Version control and source code management

To help readers visualize the SAP Fiori concept behind this project, I built a local dashboard with SAPUI5. It demonstrates how the invoice analytics could be presented in an Accounts Payable application.

## Replicate the Demo

Clone the repository, run `python -m http.server 8000` from its root folder, and open `http://localhost:8000/dashboard/`. To run the ABAP portion, use your own SAP BTP ABAP environment to create the table from `sap/`, activate the seed and analytics classes from `src/`, then run those classes in that order. I made my SAP BTP account from here, https://www.sap.com/products/technology-platform/trial.html.

## Development Status

**In Development**

Currently establishing the database architecture and foundational ABAP components.

Future enhancements may include Microsoft Azure integration and AI-assisted invoice analysis.
