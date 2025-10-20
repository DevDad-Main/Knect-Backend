# Knect - Social Networking Platform Backend

A modern, scalable backend for a social networking platform built with cutting-edge technologies.

## 🚀 Features

### Core Social Features

- **User Authentication & Authorization** - Secure JWT-based authentication
- **User Profiles** - Customizable user profiles with bio, avatar, and personal information
- **Posts & Content** - Create, edit, delete, and share posts with media support
- **Social Interactions** - Like, comment, and share functionality
- **Follow System** - Follow/unfollow users and build your network
- **Real-time Messaging** - Direct messaging between users
- **News Feed** - Personalized feed algorithm based on connections and interests
- **Notifications** - Real-time notifications for interactions and updates

### Advanced Features

- **Media Upload** - Image and video upload with cloud storage integration
- **Search & Discovery** - Find users, posts, and content with advanced search
- **Privacy Controls** - Granular privacy settings for posts and profile visibility
- **Content Moderation** - Automated and manual content moderation tools
- **Analytics** - User engagement and platform analytics
- **API Rate Limiting** - Protection against abuse and spam

## 🛠️ Tech Stack

### Backend Framework

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript

### Database

- **MongoDB** - Primary database for user data and posts
- **Mongoose** - MongoDB object modeling

### Authentication & Security

- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Cloud Services

- **Cloudinary** - Image processing and optimization

### Real-time Features

- **Socket.io** - Real-time messaging and notifications
- **WebSocket** - Live updates and notifications

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js**
- **MongoDB**
- **npm** or **yarn** package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DevDad-Main/Knect-Backend.git
cd Knect-Backend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
ACCESS_TOKEN_EXPIRY="24h"
ACCESS_TOKEN_SECRET="tokensecretgoeshere"

CORS_ORIGIN="your cors origin here"

FRONTEND_URL="your frontend url here"

IMAGEKIT_ID=""
IMAGEKIT_PRIVATE_KEY=""
IMAGEKIT_PUBLIC_KEY=""

INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

MONGODB_URL=""
PORT="5000"

REFRESH_TOKEN_EXPIRY="24h"
REFRESH_TOKEN_SECRET="tokensecretgoeshere"

SENDER_EMAIL=""
SMTP_PASS=""
SMTP_USER=""
```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Middleware

```js
export const verifyJWT = async (req, _, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "username refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
};
```

### User Endpoints

```
POST   /api/vi/user/register     - Register new user
POST   /api/v1/user/login        - User login
POST   /api/v1/user/logout       - User logout
GET    /api/v1/user/profile/:id  - Get user profile
POST   /api/v1/user/update-user  - Update user profile
POST   /api/v1/user/follow       - Follow user
POST   /api/v1/user/unfollow     - Unfollow user
POST   /api/v1/user/discover     - Discover users
GET    /api/v1/user/connections  - Get connections
```

### Posts Endpoints

```
GET    /api/v1/post/feed    - Get posts feed
POST   /api/v1/post/add     - Create new post
GET    /api/v1/post/:postId       - Get post by ID
DELETE /api/v1/post/:postId       - Delete post
POST   /api/v1/post/like  - Like/unlike post
```

### Messaging Endpoints

```
GET    /api/v1/message/get/:to_user_id  - Get conversation
POST   /api/v1/message/send             - Send message
GET    /api/v1/message/recent-messages  - Get conversation
PUT    /api/v1/message/mark-as-seen     - Mark as read
```

## 🏗️ Project Structure

```
Knect-Backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── db/                # MongoDB connection
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middleware
│   ├── utils/             # Utility functions
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment-Specific Configurations

- **Development** - Local development with hot reload
- **Production** - Optimized production deployment

## 📊 Performance & Monitoring

### Performance Features

- **Database Indexing** - Optimized queries with proper indexing
- **Image Optimization** - Automatic image compression and resizing

## 🔒 Security

### Security Measures

- **Input Validation** - Express-Validator validation for all inputs
- **XSS Protection** - Content sanitization
- **CSRF Protection** - Cross-site request forgery prevention
- **Helmet.js** - Security headers
- **Data Encryption** - Sensitive data encryption at rest

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **DevDad-Main** - Lead Developer & Project Maintainer - softwaredevdad@gmail.com

## 📈 Changelog

### v1.0.0 (Latest)

- Initial release with core social networking features
- User authentication and profile management
- Post creation and social interactions
- Real-time messaging system
- Basic notification system
