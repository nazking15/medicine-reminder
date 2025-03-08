# Medicine Reminder App

A full-stack application to help users track their medications and receive timely reminders.

## Features

- Add and manage medications with specific dosage times
- Track medication intake
- Email notifications for medication reminders
- Beautiful, responsive UI built with Material-UI
- Secure MongoDB database storage

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Email Service: Resend

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Environment Setup:
   - Create `.env` file in the server directory with:
     ```
     PORT=3001
     MONGODB_URI=mongodb://localhost:27017/medicine-reminder
     RESEND_API_KEY=your_resend_api_key
     REMINDER_TIME="0 8 * * *"
     TIMEZONE="Asia/Singapore"
     ```

4. Start the application:
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from client directory)
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 