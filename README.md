# BaliFlux Backend

Hosted version: https://baliflux-backend.onrender.com

## Description

BaliFlux Backend is the Node.js and MongoDB-powered API that supports BaliFlux. It manages user authentication and AI-driven recommendations, ensuring all information is secure and easily accessible. 

## Getting Started

### Dependencies

**Development Dependencies**
Jest: ^27.5.1
Supertest: ^6.3.4
MongoDB Memory Server: ^10.1.3

**Dependencies**
Dotenv: ^16.3.1
Bcrypt: ^5.1.1
Express: ^4.18.2
Cors: ^2.8.5
Groq SDK: ^0.9.1
JSON Web Token: ^9.0.2
MongoDB: ^6.12.0
Mongoose: ^8.9.3

**Requirements**
Node.js: v21.1.0

### Installation

1. Clone the repository
2. Run "npm install"

### Environment Variables
3. Create Environment Files: Create two .env files: .env.test and .env.development.
4. Each file should contain the appropriate mongoDB database URI for that environment, a JWT secret and API Key for Groq.

### Setting Up the Database
5. Install dependencies outlined above
6. Run the commands "npm start"

### Running Test Suite
7. Run "npm run test"
