# Medicine Reminder Application

A comprehensive medicine reminder system that helps users track their medications and receive personalized reminders.

## Features

- **Medicine Management**
  - Add, update, and track medicines
  - Flexible dosage scheduling
  - Soft deletion support

- **Smart Notifications**
  - Daily email reminders
  - AI-powered personalized messages
  - Configurable reminder times

- **Technology Stack**
  - Node.js & Express
  - MongoDB
  - Deepseek AI Integration
  - Resend Email Service

## Setup

1. Clone the repository
```bash
git clone <repository-url>
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

- `POST /api/medicines` - Add new medicine
- `GET /api/medicines/:userId` - Get user's medicines
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Deactivate medicine (soft delete)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 