# Flight Search Engine Prototype

A modern, responsive flight search application built with React, TypeScript, and Material UI. This prototype integrates with the Amadeus Self-Service API to provide real-time flight data, dynamic filtering, and price visualization.

## Features

- **Flight Search**: Search for flights by origin, destination, and date.
- **Real-time Results**: Web-based flight offers directly from the Amadeus API.
- **Advanced Filtering**: Filter results by number of stops, airlines, and price range.
- **Price Trends**: Visual price distribution graph using Recharts.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **URL Synchronization**: Search state and filters are persisted in the URL for easy sharing.

## Tech Stack

- **Core**: React, TypeScript, Vite
- **UI/UX**: Material UI (MUI)
- **Routing**: React Router v6
- **Data Visualization**: Recharts
- **Forms & Validation**: React Hook Form, Zod
- **Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Amadeus Developer Account (for API keys)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd flight-search-engine
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory and add your Amadeus API credentials:
    ```env
    VITE_AMADEUS_CLIENT_ID=your_client_id
    VITE_AMADEUS_CLIENT_SECRET=your_client_secret
    VITE_AMADEUS_API_BASE=your_amadeus_api_base
    ```
    _(Note: Ensure you do not commit your real `.env` file)_

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Building for Production

Compile the project for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## License

This project is a prototype.
