# BaliGuide Backend

Hosted version: https://baliflux-backend.onrender.com

## Description

BaliGuide Backend is the Node.js and MongoDB-powered API that supports BaliGuide. It manages user authentication and AI-driven recommendations, ensuring all information is secure and easily accessible.  
<br>
This backend was built using Node.js, JavaScript, Express, MongoDB, Bcrypt for password hashing and JWT.  
<br>
![NodeJS](https://img.shields.io/badge/node.js-%23518F4C?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript%20-%23323330.svg?&style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Express.js](https://img.shields.io/badge/express.js-%23323330.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## Getting Started

### Dependencies

**Development Dependencies**

- Jest: ^27.5.1
- Supertest: ^6.3.4
- MongoDB Memory Server: ^10.1.3

**Dependencies**

- Groq SDK: ^0.9.1
- Dotenv: ^16.3.1
- Nodemon: ^3.1.9
- Cookie Parser: ^1.4.7
- Bcrypt: ^5.1.1
- Express: ^4.18.2
- Cors: ^2.8.5
- JSON Web Token: ^9.0.2
- MongoDB: ^6.12.0
- Mongoose: ^8.9.3

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
