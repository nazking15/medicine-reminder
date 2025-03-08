# Medicine Reminder 💊

A modern medicine reminder system with AI-powered notifications that helps users track their medications and receive personalized, encouraging reminders.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?&logo=mongodb&logoColor=white)

## Features

- **Smart Medicine Management**
  - Add, update, and track medicines with intuitive interface
  - Flexible dosage scheduling with multiple time slots
  - Soft deletion support for maintaining medical history

- **AI-Powered Notifications**
  - Daily personalized email reminders using Deepseek AI
  - Context-aware motivational messages
  - Configurable reminder times with timezone support

- **Technology Stack**
  - Node.js & Express for robust backend
  - MongoDB for reliable data storage
  - Deepseek AI for intelligent message generation
  - Resend Email Service for reliable delivery

## Setup

1. Clone the repository
```bash
git clone https://github.com/nazking15/medicine-reminder.git
cd medicine-reminder
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file with the following:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/medicine-reminder
RESEND_API_KEY=your_resend_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
REMINDER_TIME="0 8 * * *"
TIMEZONE="Asia/Singapore"
NODE_ENV=development
```

4. Start the application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Medicines
- `POST /api/medicines` - Add new medicine
- `GET /api/medicines/:userId` - Get user's medicines
- `PUT /api/medicines/:id` - Update medicine details
- `DELETE /api/medicines/:id` - Deactivate medicine (soft delete)

### Notifications
- Automated daily reminders at configured time
- AI-generated personalized messages
- Email delivery status tracking

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the ISC License.

## Acknowledgments

- Deepseek AI for providing the message generation API
- Resend for reliable email delivery
- MongoDB for robust data storage 