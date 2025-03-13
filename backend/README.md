# Financial Risk Management System

## Overview
The Financial Risk Management System is designed to assess, manage, and mitigate financial risks using modern web technologies. The backend is built using Node.js and MongoDB, with Redis for caching and a message queue system for processing financial data asynchronously. It ensures secure authentication, efficient data handling, and robust risk assessment capabilities.

## Features
- **User Authentication**: Secure login and registration with JWT, bcrypt for password hashing.
- **Password Management**: Secure password reset and change functionality.
- **Financial Data Processing**: Handles large sets of financial records via a queue system using Bull (Redis-based queue).
- **Risk Assessment**: Retrieve and assess financial risks based on various parameters, including industry sector and reporting period.
- **Rate Limiting**: Prevents abuse using express-rate-limit middleware.
- **Logging & Monitoring**: Logs system activities using Winston and supports real-time monitoring via an admin dashboard.
- **Data Caching**: Implements Redis caching for frequently accessed financial data.
- **Testing Framework**: Ensures system reliability with Jest and Supertest.

---

## System Architecture

### ER Diagram

```plaintext
[User] <---> [Financial Data]
[User] <---> [Password Reset]
[Financial Data] <---> [Queue Processing]
[Financial Data] <---> [Risk Analysis]
[Queue Processing] <---> [Worker Nodes]
```

### System Flow

#### 1. User Authentication Flow
1. User registers using email and password.
2. On successful registration, a JWT token is generated and stored.
3. User logs in, and the JWT token is issued for session management.
4. Secure password reset using email token verification.

#### 2. Financial Data Processing Flow
1. User uploads financial data in bulk (max 500 records per request).
2. Data is validated and stored in MongoDB.
3. A queue (`financialQueue.js`) processes the data asynchronously.
4. Worker nodes (`financialWorker.js`) process queued data efficiently.
5. Processed data is stored in MongoDB and cached in Redis.

#### 3. Risk Assessment Flow
1. Users query financial data using filters such as `company_id`, `reporting_period`, or `industry_sector`.
2. The system first checks Redis for cached data.
3. If data is not in the cache, it is fetched from MongoDB and then cached.
4. The response is paginated and sent to the user.

---

## Project Directory Structure

```
backend
|-config
| |-databases
| | |-mongoconn.js
| | |-redis.js
|-controllers
| |-authController.js
| |-userController.js
| |-financialController.js
|-middleware
| |-authMiddleware.js
| |-catchAsyncErrors.js
| |-errorHandler.js
| |-rateLimiter.js
|-models
| |-financialModel.js
| |-passwordResetModel.js
| |-userModel.js
|-routes
| |-authRoutes.js
| |-userRoutes.js
| |-financialRoutes.js
|-utils
| |-logger.js
|-services
| |-EmailService.js
| |-jwtServices.js
| |-riskAssessmentService.js
|-test
| |-financialRoutes.test.js
|-workers
| |-financialQueue.js
| |-financialWorker.js
|-.env
|-.gitignore
|-app.js
|-package-lock.json
|-package.json
|-README.md
|-server.js
|-test.js
```

---

## Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Caching:** Redis
- **Authentication:** JWT, bcrypt
- **Queue Processing:** Bull (Redis-based queue)
- **Logging:** Winston
- **Monitoring:** Admin dashboard integration
- **Testing:** Jest, Supertest

---

## Installation

### Prerequisites
Ensure you have the following installed:
- Node.js (latest LTS version recommended)
- MongoDB (local or cloud-based like MongoDB Atlas)
- Redis (for caching and queue management)
- Git (to clone the repository)

### Steps to Install and Run the Project

1. **Clone the repository**:
   ```sh
   git clone https://github.com/MITTALBHAVYA/EnvintAssignment.git
   ```

2. **Navigate to the backend directory**:
   ```sh
   cd EnvintAssignment/backend
   ```

3. **Install dependencies**:
   ```sh
   npm install
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```plaintext
   MONGO_URI=your_mongodb_connection_string
   REDIS_HOST=your_redis_host
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=your_frontend_url
   ```

5. **Start the Redis server** (if running locally):
   ```sh
   redis-server
   ```

6. **Run the application**:
   - For production:
     ```sh
     npm start
     ```
   - For development with hot reload:
     ```sh
     npm run dev
     ```
   - To start background workers for processing financial data:
     ```sh
     npm run worker
     ```

7. **Run tests**:
   ```sh
   npm test
   ```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Log in and receive a JWT token.
- `POST /api/auth/forgot-password` - Request a password reset link.
- `PUT /api/auth/reset-password/:token` - Reset password.

### User Management
- `PUT /api/user/change-password` - Change user password.
- `PUT /api/user/update-profile` - Update user profile.

### Financial Data
- `POST /api/financial/upload` - Upload financial data.
- `GET /api/financial/risk-assessment` - Get risk assessment data.
- `GET /api/financial/cached-data` - Retrieve cached financial data.

---

## License
This project is licensed under the MIT License.

