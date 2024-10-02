# Hawaii Attorney Database

A web application that provides a searchable and filterable database of attorneys licensed in Hawaii.

## Features

- Responsive data grid with sorting, filtering, and pagination
- Dark/light mode toggle
- Quick search functionality
- Column management
- Data export capabilities
- Responsive design for various screen sizes

## Technologies Used

- React
- TypeScript
- Vite
- Material-UI (MUI)
- MUI X-Data Grid
- Papa Parse (for CSV parsing)

## Getting Started

### Prerequisites

- Node.js (version 14 or later recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/hawaii-attorney-database.git
   cd hawaii-attorney-database
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Development

To run the development server:

```
npm run dev
```

or

```
yarn dev
```

This will start the development server, typically at `http://localhost:5173`.

### Building for Production

To create a production build:

```
npm run build
```

or

```
yarn build
```

The built files will be in the `dist` directory.

## Data Source

The attorney data is sourced from the [Hawaii State Bar Association (HSBA) Member Directory](https://hsba.org/HSBA_2020/For_the_Public/Find_a_Lawyer/HSBA_2020/Public/Find_a_Lawyer.aspx). The data is processed and stored in a CSV file (`public/processed-member-records.csv`), which is loaded by the application at runtime.