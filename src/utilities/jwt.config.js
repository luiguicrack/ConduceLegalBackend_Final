import dotenv from 'dotenv';
dotenv.config();

export default {
  secret: process.env.JWT_SECRET || 'clave_secreta_conduce_legal',
  expiresIn: '24h'
};