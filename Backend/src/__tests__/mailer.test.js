jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn().mockResolvedValue()
  }))
}), { virtual: true });

describe('mailer', () => {
  beforeEach(() => {
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'secret';
    jest.resetModules();
  });

  test('crea un transporter con la configuración esperada', async () => {
    jest.isolateModules(() => {
      const nodemailer = require('nodemailer');
      const transporter = require('../utils/mailer');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'test@example.com',
          pass: 'secret'
        }
      });
      expect(typeof transporter.verify).toBe('function');
    });
  });
});
