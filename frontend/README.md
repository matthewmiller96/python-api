# Shipping API Frontend

A modern React TypeScript frontend for the multi-carrier shipping API platform.

## Features

- 🔐 **User Authentication** - JWT-based login and registration
- 📍 **Location Management** - Create and manage shipping origin locations
- 🚚 **Carrier Integration** - Configure FedEx, UPS, and USPS credentials
- 🔑 **Token Generation** - Generate bearer tokens for carrier APIs
- 📊 **Dashboard** - Overview of locations, carriers, and shipments
- 🎨 **Modern UI** - Material-UI components with responsive design

## Tech Stack

- **React 19.1** with TypeScript
- **Material-UI v7** for components and theming
- **React Router** for navigation
- **Axios** for API communication
- **React Context** for state management

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on port 3000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm start
```

The app will open at `http://localhost:3001`

### Environment Variables

The frontend expects the backend API to be running at `http://localhost:3000`. This can be configured in `src/services/authService.ts`.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Page components
│   ├── Login.tsx       # User login
│   ├── Register.tsx    # User registration
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Locations.tsx   # Origin location management
│   ├── Carriers.tsx    # Carrier credential management
│   ├── TokenGenerator.tsx # Bearer token generation
│   └── Shipments.tsx   # Shipment management (coming soon)
├── services/           # API service functions
│   ├── authService.ts  # Authentication API calls
│   └── apiService.ts   # Main API service
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
└── App.tsx             # Root component with routing
```

## Key Features

### Authentication Flow
- JWT token-based authentication with automatic refresh
- Protected routes with redirect to login
- User profile management

### Dashboard
- Overview statistics for locations, carriers, and shipments
- Quick action cards for common tasks
- Getting started guide for new users

### Location Management
- Create/edit/delete origin locations with full address validation
- Default location setting and company information support

### Carrier Configuration
- Support for FedEx, UPS, and USPS with secure credential storage
- Test token generation and active/inactive management

### Token Generator
- Test bearer token generation with manual credentials
- Token preview and copy functionality

## Development Notes

This project is part of the multi-carrier shipping API platform built with:
- Create React App and TypeScript
- Material-UI for consistent design
- Axios interceptors for authentication
- React Context for global state
- Responsive design for all screen sizes
