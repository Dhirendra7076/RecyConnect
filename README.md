# RecyConnect

A recycling marketplace for urban India. Households list waste, verified
kabadiwalas and recyclers pick it up, everyone tracks the environmental impact.

## Stack

- **Frontend:** React 18 + Vite, Tailwind CSS + DaisyUI, React Router v6,
  Axios, Leaflet / OpenStreetMap
- **Auth:** Custom JWT (issued by the backend)
- **State:** Context API + custom hooks (no Redux)
- **Hosting:** AWS Amplify (frontend), backend TBD

## Local development

```bash
cd frontend
cp .env.example .env
npm install
npm run dev